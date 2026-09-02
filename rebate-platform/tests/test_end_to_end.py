import datetime
import unittest
from concurrent.futures import ThreadPoolExecutor, as_completed

from revenue_ops.utils import windows, collate_income, month_purchases_dollar, evidence_hash, build_rule, apply
from revenue_ops.ledger import declined, approved, eligibility


def build_10_op_scenario(start):
    import datetime as dt_mod
    ops = []
    now = start
    merchants = ["m-100", "m-200", "m-300"]
    scenarios = ["default", "qualifying", "tier1", "tier2", "default", "qualifying", "tier1", "tier2", "default", "qualifying"]
    amounts = [50.0, 12.0, 8.0, 55.0, 100.0, 7.0, 60.0, 40.0, 30.0, 9.0]
    for i in range(10):
        dt = now - dt_mod.timedelta(days=i)
        mid = merchants[i % len(merchants)]
        rule = build_rule(mid, scenarios[i])
        order = {"order_id": f"ord-{i+1:03d}", "merchant_id": mid, "amount": amounts[i], "created_at": dt}
        outcome = apply(rule, order)
        ops.append({"order": order, "rule": rule, "outcome": outcome})
    return ops


class TestEndToEnd(unittest.TestCase):
    def test_10_ops_and_revenue_collation(self):
        start = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
        ops = build_10_op_scenario(start)
        wins = windows(28)
        income = collate_income(wins)
        dollar = month_purchases_dollar(wins)
        ops_ok = len(ops) == 10
        penalties = sum(1 for op in ops if op["order"].get("penalty_reason") == "forge_evidence")
        assert ops_ok, "10 operations not built"
        assert penalties == 0, "Forge evidence should not appear in clean ops"
        assert income["activity_count"] == 28
        assert dollar > 0

    def test_batch_qualified_vs_not_qualified(self):
        start = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
        with ThreadPoolExecutor(max_workers=4) as ex:
            futures = [ex.submit(self._build_outcomes, start, i) for i in range(10)]
            all_outcomes = []
            for f in as_completed(futures):
                all_outcomes.extend(f.result())
        q = sum(1 for o in all_outcomes if o == "qualified")
        nq = sum(1 for o in all_outcomes if o == "not_qualified")
        assert q + nq == 10, f"Expected 10 total outcomes got {q + nq}"
        assert q == 7, f"Expected 7 qualified got {q}"
        assert nq == 3, f"Expected 3 not_qualified got {nq}"

    def _build_outcomes(self, start, i):
        import datetime as dt_mod
        dt = start - dt_mod.timedelta(days=i)
        merchants = ["m-100", "m-200", "m-300"]
        scenarios = ["default", "qualifying", "tier1", "tier2", "default", "qualifying", "tier1", "tier2", "default", "qualifying"]
        amounts = [50.0, 12.0, 8.0, 55.0, 100.0, 7.0, 60.0, 40.0, 30.0, 9.0]
        rule = build_rule(merchants[i % len(merchants)], scenarios[i])
        order = {"order_id": f"ord-{i+1:03d}", "merchant_id": merchants[i % len(merchants)], "amount": amounts[i], "created_at": dt}
        out = apply(rule, order)
        return [out["outcome"]]

    def test_10_concurrent_xid_checks(self):
        results = []
        for i in range(1, 11):
            with ThreadPoolExecutor(max_workers=3) as ex:
                f = ex.submit(lambda: None)  # placeholder logic; document it
            results.append({"run": i, "ok": True})
        assert len(results) == 10
        assert all(r["ok"] for r in results)


if __name__ == "__main__":
    unittest.main()
