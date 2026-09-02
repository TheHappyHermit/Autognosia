import datetime
import io
import hashlib


def windows(days=28):
    """Return consecutive fixed 28-day windows ending at utcnow."""
    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    wins = []
    base = now
    while len(wins) < days:
        end = base
        start = base - datetime.timedelta(days=28)
        wins.append((start, end))
        base = start
    wins.reverse()
    return wins


def collate_income(wins):
    first = next(iter(wins), None)
    last = wins[-1] if wins else None
    return {
        "first_window_start": first[0].isoformat() + "Z" if first else None,
        "last_window_end": (last[1].isoformat() + "Z") if last else None,
        "activity_count": len(wins),
    }


def month_purchases(wins):
    # Map each 28-day window to a day value. Take 10% as purchase contribution.
    return sum(max(0.0, 0.1 * (w[1] - w[0]).days) for w in wins)


def month_purchases_dollar(wins):
    # Map each 28-day window to a dollar value.
    return sum(max(0.0, 0.1 * (w[1] - w[0]).days) for w in wins)


def evidence_hash(evidence):
    if not evidence:
        return ""
    buf = io.StringIO()
    for item in sorted(evidence, key=lambda x: x.get("id", "")):
        buf.write(item.get("data", ""))
    return hashlib.sha256(buf.getvalue().encode("utf-8")).hexdigest()


def build_rule(merchant_id, scenario):
    return {
        "rule_id": f"rule-{merchant_id}-{scenario}",
        "merchant_id": merchant_id,
        "scenario": scenario,
        "eligibility": {"min_purchase": 10.0},
        "rebate": {"type": "percentage", "value": 0.05},
        "status": "draft",
    }


def apply(rule, submitted_order):
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


def pseudo_signature(verified, evidence):
    import hmac as hmac_mod
    payload = {"verified": verified, "evidence_hash": evidence_hash(evidence), "ts": datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None).isoformat()}
    secret = b"demo-sec-control-secret"
    return hmac_mod.new(secret, repr(payload).encode(), hashlib.sha256).hexdigest()[:32]
