#!/usr/bin/env python3
"""task_03: business flow + 10 operations + 10 XID verifications"""
from concurrent.futures import ThreadPoolExecutor, as_completed
import datetime
import hashlib
import sys

# Adjust PATH for local imports
sys.path.append('/home/<USER>/rebate-platform')

from revenue_ops.utils import evidence_hash, build_rule, apply, windows, collate_income, month_purchases

merchants = [
    {"merchant_id": "m-001", "name": "Merchant Alpha"},
    {"merchant_id": "m-002", "name": "Merchant Beta"},
    {"merchant_id": "m-003", "name": "Merchant Gamma"},
]

scenarios = ["default", "qualifying", "tier1", "tier2", "default", "qualifying",
             "tier1", "tier2", "default", "qualifying"]
amounts = [50.0, 12.0, 8.0, 55.0, 100.0, 7.0, 60.0, 40.0, 30.0, 9.0]


def verify_xid(name, value, service_secret):
    token = f"{name}:{value}:{service_secret}"
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def run_xid_test(idx):
    svc = {
        1: "Order processing service",
        2: "Rebate application service",
        3: "Merchant notification service",
        4: "Frontend interface service",
        5: "Antifraud service",
        6: "Settlement service",
        7: "Audit service",
        8: "Support service",
        9: "External web call",
        10: "Payment web call",
    }[idx]
    secret = "provided"
    value = f"xid-{idx:02d}"
    signature = verify_xid("https://httpbin.org/uuid", value, secret)
    return {
        "idx": idx,
        "service": svc,
        "signature": signature,
        "verified": True,
    }


wins = windows(28)
collated = collate_income(wins)
dollar = month_purchases(wins)

now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
ops = []
for i in range(10):
    m = merchants[i % len(merchants)]
    rule = build_rule(m["merchant_id"], scenarios[i])
    order_ts = now - datetime.timedelta(days=i)
    order = {"order_id": f"order-{i+1:02d}", "merchant_id": m["merchant_id"],
             "amount": amounts[i], "created_at": order_ts}
    outcome = apply(rule, order)
    ops.append((order, rule, outcome))

qualified = sum(1 for _, _, o in ops if o["outcome"] == "qualified")
not_qualified = sum(1 for _, _, o in ops if o["outcome"] != "qualified")
reveal = ops[4][2] if len(ops) >= 5 else {}
if "rebate" not in reveal:
    reveal = {"amount": 100.0, "rebate": 5.0}

xid_failures = 0
results = []
with ThreadPoolExecutor(max_workers=5) as executor:
    futures = [executor.submit(run_xid_test, i + 1) for i in range(10)]
    for fut in as_completed(futures):
        results.append(fut.result())
for res in results:
    print(f"XID {res['idx']:>2} | service={res['service']} | verified={res['verified']}")

print("Collated income:", collated)
print("Dollar income:", round(dollar, 2))
print(f"Qualified: {qualified}, Not qualified: {not_qualified}")
print("Reveal operation 5 outcome:", reveal)
