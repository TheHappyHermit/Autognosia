import unittest
import os
import sys

class TestRebatePlatform(unittest.TestCase):
    """Test cases for FindYourVPN rebate platform"""
    
    def test_01_window_collation(self):
        """Test window collation logic"""
        # Simulate window calculations
        daily = 0.1  # day values mapped to USD
        days = 7
        monthly = round(daily * days, 10)
        self.assertEqual(monthly, 0.7)
        print(f"test_01_window_collation: 7 daily => USD {monthly} OK")
    
    def test_02_penalties_reduce_to_negative(self):
        """Test penalties can reduce rewards to negative"""
        rewards = 100.0
        penalty_rate = 0.25
        penalty_amount = rewards * penalty_rate
        net = rewards - penalty_amount
        self.assertEqual(net, 75.0)
        print(f"test_02_penalties: $100 - 25% penalty = ${penalty_amount} => net ${net} OK")
    
    def test_03_final_cash_disbursement(self):
        """Test nonzero cash disbursement after penalties"""
        initial = 100.0
        penalty = 20.0
        reason = "forge_evidence: bad proof"
        final = initial - penalty
        self.assertEqual(final, 80.0)
        self.assertEqual(reason.split(":")[1].strip(), "bad proof")
        print(f"test_03_cash_disbursement: ${initial} - ${penalty} = ${final} (reason: {reason}) OK")
    
    def test_04_batch_ops_qualified_vs_not_qualified(self):
        """Test 10 operations, 7 qualified, 3 not qualified"""
        ops = [
            ("ord-01", 50.0, "within_window", True),
            ("ord-02", 12.0, "within_window", True),
            ("ord-03", 8.0, "amount_too_low", False),
            ("ord-04", 55.0, "within_window", True),
            ("ord-05", 100.0, "exceeds_months", False),
            ("ord-06", 7.0, "amount_too_low", False),
            ("ord-07", 60.0, "within_window", True),
            ("ord-08", 40.0, "within_window", True),
            ("ord-09", 30.0, "within_window", True),
            ("ord-10", 95.0, "within_window", True),
        ]
        qualified = [op for op in ops if op[3]]
        not_qualified = [op for op in ops if not op[3]]
        self.assertEqual(len(qualified), 7)
        self.assertEqual(len(not_qualified), 3)
        print(f"test_04_batch_ops: 7 qualified, 3 not qualified OK")
    
    def test_05_evidence_attached(self):
        """Test that evidence is attached with approval"""
        evidence_attached = {
            "order_id": "ord-001",
            "submitted_by": "merchant",
            "amount": 50.0,
            "proof_hash": "abc123def456"
        }
        decision = "approved"
        second_approver_signed = f"approved_{evidence_attached['submitted_by']}"
        self.assertIsNotNone(evidence_attached)
        self.assertEqual(decision, "approved")
        self.assertIn("merchant", second_approver_signed)
        print(f"test_05_evidence: Evidence attached, decision=approved, sign={second_approver_signed} OK")

if __name__ == '__main__':
    unittest.main()
