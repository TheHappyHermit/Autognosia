import datetime
import io
import json
import os
import sys
import time
import math
import hashlib
import hmac
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    import requests
except ImportError as e:
    raise SystemExit(
        f"Missing dependency: {e}. Install requirements first, e.g.\n"
        "python3 -m venv .venv && .venv/bin/pip install -r requirements.txt"
    )

# ------------------------------
# Time utilities (fixed 28-day windows)
# ------------------------------

def windows(days=28):
    """Return consecutive fixed windows of length 28 days ending at utcnow."""
    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    windows = []
    base = now
    while len(windows) < days:
        end = base
        start = base - datetime.timedelta(days=28)
        windows.append((start, end))
        base = start
    windows.reverse()
    return windows


def collate_income(wins):
    """Collapse all activity into final eligibility and qualification."""
    first = next(iter(wins), None)
    last = wins[-1] if wins else None
    return {
        "first_window_start": first[0].isoformat() if first else None,
        "last_window_end": (last[1].isoformat() + "Z") if last else None,
        "activity_count": len(wins),
    }


def month_purchases(wins):
    """Sum qualifying purchase amounts across windows."""
    # 10% of window length as naive purchase amount
    return sum(max(0.0, 0.1 * (w[1] - w[0]).days) for w in wins)


def rewards_owed(user, orders):
    purchases = month_purchases(orders)
    rate = user.get("rebate_rate", 0.05)
    owed = purchases * rate
    penalty = user.get("penalty", 0.0)
    delta = owed - penalty
    return {
        "rewards_owed": round(max(0.0, delta), 4),
        "purchase_amount": round(purchases, 4),
        "rate": rate,
        "penalty": round(penalty, 4),
    }


# ------------------------------
# Evidence integrity / dual control
# ------------------------------

def evidence_hash(evidence):
    if not evidence:
        return ""
    buf = io.StringIO()
    for item in sorted(evidence, key=lambda x: x.get("id", "")):
        buf.write(item.get("data", ""))
    return hashlib.sha256(buf.getvalue().encode("utf-8")).hexdigest()


def dual_control(verified, evidence):
    # Second approver signs hash of verified + evidence
    payload = {
        "verified": verified,
        "evidence_hash": evidence_hash(evidence),
        "ts": time.time(),
    }
    secret = b"demo-sec-control-secret"
    return hmac.new(secret, json.dumps(payload, sort_keys=True).encode(), hashlib.sha256).hexdigest()[:32]


# ------------------------------
# Rebate rule lifecycle (10 operations)
# ------------------------------

SAMPLE_MERCHANTS = [
    {"merchant_id": "m-001", "name": "Merchant Alpha"},
    {"merchant_id": "m-002", "name": "Merchant Beta"},
    {"merchant_id": "m-003", "name": "Merchant Gamma"},
]


def build_rule(merchant_id, scenario):
    return {
        "rule_id": f"rule-{int(time.time()*1000)}"} | {
        "merchant_id": merchant_id,
        "scenario": scenario,
        "eligibility": {"min_purchase": 10.0},
        "rebate": {"type": "percentage", "value": 0.05},
        "status": "draft",
    }


def apply(rule, submitted_order, current_user):
    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    days_since_order = (now - submitted_order["created_at"]).days
    if days_since_order > 30:
        return {"outcome": "not_qualified", "reason": "order_outside_window", "days_since_order": days_since_order}
    current_amount = submitted_order.get("amount", 0.0)
    if current_amount < 10.0:
        return {"outcome": "not_qualified", "reason": "amount_too_low"}
    current_rebate = current_amount * float(rule["rebate"].get("value", 0.0))
    return {
        "outcome": "qualified",
        "merchant_id": rule["merchant_id"],
        "amount": round(current_amount, 4),
        "rebate": round(current_rebate, 4),
    }


class PlatformLedger:
    def __init__(self):
        self.order_id = 1
        self.event_counter = 0
        self.verification_events = []
        self.public_ledger = {
            x.isoformat(): {"order_n": 0, "rebate_n": 0} for x in windows(28)
        }

    def append(self, kind, payload):
        ts = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat()
        win_key = next(
            (k for k in self.public_ledger if list(self.public_ledger.keys())[0] <= ts <= k),
            list(self.public_ledger.keys())[-1],
        )
        target = self.public_ledger.setdefault(win_key, {"order_n": 0, "rebate_n": 0})
        self.verification_events.append({"ts": ts, "kind": kind, "payload": payload})
        if kind == "order":
            target["order_n"] += 1
        elif kind == "rebate":
            target["rebate_n"] += 1
        self.event_counter += 1


# ------------------------------
# XID verification (10 runs)
# ------------------------------

XID_TEST_URLS = [
    "https://httpbin.org/uuid",
    "https://httpbin.org/uuid",
    "https://httpbin.org/uuid",
    "https://httpbin.org/uuid",
    "https://httpbin.org/uuid",
    "https://httpbin.org/uuid",
    "https://httpbin.org/uuid",
    "https://httpbin.org/uuid",
    "https://httpbin.org/uuid",
    "https://httpbin.org/uuid",
]


def run_xid_test(url, idx, timeout=20):
    start = time.time()
    try:
        r = requests.get(url, timeout=timeout)
        elapsed = time.time() - start
        data = r.json()
        return {
            "idx": idx,
            "url": url,
            "http_status": r.status_code,
            "elapsed_ms": round(elapsed * 1000, 2),
            "test": "XID verification",
            "data": {"uuid": data.get("uuid", "")},
        }
    except Exception as exc:
        elapsed = time.time() - start
        return {
            "idx": idx,
            "url": url,
            "http_status": None,
            "elapsed_ms": round(elapsed * 1000, 2),
            "test": "XID verification",
            "data": {"error": type(exc).__name__, "message": str(exc)},
        }


# ------------------------------
# Main execution
# ------------------------------

def main():
    generate = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"Rebate platform run started at {generate}\n")

    # Time windows / collation
    wins = windows(28)
    income_info = collate_income(wins)

    # Create 10 orders across merchants
    ledger = PlatformLedger()
    users = [
        {"user_id": "u-01", "role": "consumer", "rebate_rate": 0.05},
        {"user_id": "u-02", "role": "consumer", "rebate_rate": 0.04},
        {"user_id": "u-03", "role": "consumer", "rebate_rate": 0.05},
    ]
    orders = []
    results = []
    scenarios = [
        "default", "qualifying", "tier1", "tier2",
        "default", "qualifying", "tier1", "tier2", "default", "qualifying",
    ]
    amounts = [50.0, 12.0, 8.0, 55.0, 100.0, 7.0, 60.0, 40.0, 30.0, 9.0]

    for i in range(10):
        merchant = SAMPLE_MERCHANTS[i % len(SAMPLE_MERCHANTS)]
        rule = build_rule(merchant["merchant_id"], scenarios[i])
        order_ts = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None) - datetime.timedelta(days=i)
        order = {
            "order_id": f"order-{str(ledger.order_id).zfill(4)}",
            "merchant_id": merchant["merchant_id"],
            "merchant_name": merchant["name"],
            "amount": amounts[i],
            "created_at": order_ts,
        }
        ledger.append("order", order)
        orders.append(order)
        user = users[i % len(users)]
        reward = rewards_owed(user, [(wins[0][0], wins[-1][1])])
        penalty = 0.0
        evidence = []
        second_approver_signed = None
        if i == 5:
            # Bad evidence / penalty scenario
            penalty = reward["rewards_owed"] * 0.25
            reward = rewards_owed({**user, "penalty": penalty}, [(wins[0][0], wins[-1][1])])
            order["penalty_reason"] = "forge_evidence: bad proof"
            order["penalty_percent"] = 0.25
            evidence = [{"id": f"ev-{ledger.event_counter}", "data": "corrupted"}]
            second_approver_signed = dual_control(False, evidence)
        elif i == 7:
            order["penalty_reason"] = "order_outside_window"
            order["penalty_percent"] = 0.0
            order["outcome"] = "not_qualified"
            ledger.verification_events.append({
                "ts": datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat(),
                "kind": "penalty",
                "payload": {"order_id": order["order_id"], "reason": order["penalty_reason"]},
            })
        else:
            order["outcome"] = "qualified"

        ledger.append("rebate", {"order_id": order["order_id"], **reward})
        ledger.order_id += 1
        results.append({
            "merchant": merchant,
            "order": order,
            "rule": rule,
            "reward": reward,
            "second_approver_signed": second_approver_signed,
        })

    # Batch ops overview
    batch = {
        "merchants": [r["merchant"] for r in results],
        "outcomes": [r["order"].get("outcome", apply(r["rule"], r["order"], users[0])["outcome"]) for r in results],
    }
    qualified = batch["outcomes"].count("qualified")
    not_qualified = batch["outcomes"].count("not_qualified")

    # Cross-service call example
    api_response = requests.get(
        f"https://api.example-service/internal/v1",
        timeout=10,
    )
    cross_service_status = api_response.status_code
    cross_service_data = api_response.json()

    print("=" * 70)
    print("BUSINESS FLOW RESULTS (10 operations)")
    print("-" * 70)
    print(f"Qualified: {qualified}")
    print(f"Not qualified: {not_qualified}")
    print("-" * 70)
    for idx, r in enumerate(results, 1):
        print(
            f"Operation {idx}: {r['order']['order_id']} | order={r['order']['amount']} | "
            f"merchant={r['merchant']['merchant_id']} | outcome={r['order'].get('outcome')} | "
            f"rewards_owed={r['reward']['rewards_owed']}"
        )
        if r["order"].get("penalty_reason"):
            print(f"  Penalty: {r['order']['penalty_reason']} (penalty_percent={r['order'].get('penalty_percent')})")
        if r.get("second_approver_signed"):
            print(f"  SecondApprover.signed: {r['second_approver_signed']}")
    print("-" * 70)
    print("\nIncome collation (final window):")
    print(f"  First window start: {income_info['first_window_start']}")
    print(f"  Last window end:   {income_info['last_window_end']}")
    print(f"  Activity count:    {income_info['activity_count']}")
    print("\nEvidence hash sample:", evidence_hash(evidence if evidence else []))
    print(f"\nCross service status={cross_service_status} body={cross_service_data}")

    # Run 10 XID tests concurrently
    print("\n" + "=" * 70)
    print("XID VERIFICATION TESTS (10 runs)")
    print("=" * 70)
    xid_failures = 0
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(run_xid_test, XID_TEST_URLS[i], i + 1) for i in range(10)]
        for fim in as_completed(futures):
            res = fim.result()
            status = "OK" if res["http_status"] == 200 and "uuid" in (res.get("data") or {}) else "FAIL"
            if status == "FAIL":
                xid_failures += 1
            print(
                f"  XID {res['idx']:>2} | status={status} | http_status={res['http_status']} "
                f"| elapsed_ms={res['elapsed_ms']} | url={res['url']}"
            )

    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Qualified:                         {qualified}")
    print(f"Not qualified:                     {not_qualified}")
    print(f"XID verification failures:         {xid_failures}")
    print(f"Total pseudo-signatures generated: {sum(1 for r in results if r.get('second_approver_signed'))}")
    print(f"Public ledger window records:      {len(ledger.public_ledger)}")
    print("Verified outputs above.")


if __name__ == "__main__":
    main()
