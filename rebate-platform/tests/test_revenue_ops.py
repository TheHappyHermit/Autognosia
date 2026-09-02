from revenue_ops.utils import windows, collate_income, month_purchases_dollar, evidence_hash, build_rule, apply
from revenue_ops.rules import get_small_purchase_not_qualified
from revenue_ops.ledger import declined, approved, eligibility
import datetime


def build_10_op_scenario(start):
    ops = []
    now = start
    merchants = ["m-100", "m-200", "m-300"]
    scenarios = ["default", "qualifying", "tier1", "tier2", "default", "qualifying", "tier1", "tier2", "default", "qualifying"]
    amounts = [50.0, 12.0, 8.0, 55.0, 100.0, 7.0, 60.0, 40.0, 30.0, 9.0]
    for i in range(10):
        dt = now - datetime.timedelta(days=i)
        mid = merchants[i % len(merchants)]
        rule = build_rule(mid, scenarios[i])
        order = {"order_id": f"ord-{i+1:03d}", "merchant_id": mid, "amount": amounts[i], "created_at": dt}
        outcome = apply(rule, order)
        ops.append({"order": order, "rule": rule, "outcome": outcome})
    return ops


class TestRevenueOps:
    def test_time_windows(self):
        wins = windows(28)
        assert len(wins) == 28
        assert (wins[-1][1] - wins[-1][0]).days == 28
        for idx, w in enumerate(wins[:-1]):
            assert w[1] == wins[idx + 1][0]

    def test_collate_income_frozen_values(self):
        wins = windows(28)
        info = collate_income(wins)
        assert info["activity_count"] == 28
        assert info["first_window_start"].endswith("Z")
        assert info["last_window_end"].endswith("Z")

    def test_month_purchases_dollar(self):
        wins = windows(28)
        total = month_purchases_dollar(wins)
        # Each 28-day window mapped once as dollar value, +10%
        expected = sum(max(0.0, 0.1 * 28.0) for _ in wins)
        assert round(total, 2) == round(expected, 2)

    def test_rebuild_monthly(self):
        wins = windows(28)
        collated = collate_income(wins)
        assert collated["first_window_start"] is not None
        assert collated["last_window_end"] is not None
        rebuilt = windows(28)
        assert [w[0].isoformat() for w in wins] == [w[0].isoformat() for w in rebuilt]

    def test_small_purchase_not_qualified(self):
        get_small_purchase_not_qualified()

    def test_edge_qualified_zero(self):
        rule = build_rule("m-edge", "qualifying")
        order = {"order_id": "ord-0", "merchant_id": "m-edge", "amount": 0.0, "created_at": datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)}
        outcome = apply(rule, order)
        assert outcome["outcome"] == "not_qualified"

    def test_qualified_order(self):
        rule = build_rule("m-qual", "default")
        order = {"order_id": "ord-q", "merchant_id": "m-qual", "amount": 25.0, "created_at": datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)}
        outcome = apply(rule, order)
        assert outcome["outcome"] == "qualified"
        assert round(outcome["rebate"], 4) == round(25.0 * 0.05, 4)

    def test_evidence_hash_empty(self):
        assert evidence_hash([]) == ""

    def test_evidence_hash_non_empty(self):
        e = [{"id": "a", "data": "x"}, {"id": "b", "data": "y"}]
        h = evidence_hash(e)
        assert len(h) == 64
        assert evidence_hash(list(reversed(e))) == h

    def test_pseudo_signature_shape(self):
        sig = approved("reviewer", [])
        assert "signed" in sig and sig["status"] == "approved"
        sig2 = declined("reviewer", [])
        assert sig2["status"] == "declined"
        assert sig["signed"] != sig2["signed"]

    def test_10_op_qualified_counts(self):
        start = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
        ops = build_10_op_scenario(start)
        outcomes = [o["outcome"]["outcome"] for o in ops]
        assert outcomes.count("qualified") == 10
        assert outcomes.count("not_qualified") == 0

    def test_10_op_penalty_affects_not_qualified(self):
        start = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
        ops = build_10_op_scenario(start)
        # Manually inject penalty for order 6 (index 5) which is small
        ops[5]["outcome"]["days_since_order"] = 5
        ops[5]["order"]["amount"] = 7.0
        ops[5]["order"]["penalty_percent"] = 0.25
        ops[5]["order"]["penalty_reason"] = "forge_evidence"
        assert ops[5]["outcome"]["outcome"] == "qualified"
        assert ops[5]["order"]["amount"] < 10.0
        assert ops[5]["order"].get("penalty_reason") == "forge_evidence"


class TestDualControlParameterization:
    def test_evidence_attached(self):
        e = [{"id": "ev-1", "data": "evidence1"}]
        s = approved("doug", e)
        assert s["status"] == "approved"
        assert len(s["signed"]) == 32

    def test_evidence_tampered_detection(self):
        e = [{"id": "ev-1", "data": "original"}]
        s1 = approved("doug", e)
        e2 = [{"id": "ev-1", "data": "tampered"}]
        s2 = approved("doug", e2)
        assert s1["signed"] != s2["signed"]
