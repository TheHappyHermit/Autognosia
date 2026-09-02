from revenue_ops.utils import apply as _apply
from revenue_ops.utils import build_rule as _build_rule


def get_small_purchase_not_qualified():
    rule = _build_rule("m-01", "default")
    order = {
        "order_id": "ord-001",
        "merchant_id": "m-01",
        "amount": 9.99,
        "created_at": _now(),
    }
    outcome = _apply(rule, order)
    assert outcome["outcome"] == "not_qualified"
    assert outcome.get("reason") == "amount_too_low"


def _now():
    import datetime
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
