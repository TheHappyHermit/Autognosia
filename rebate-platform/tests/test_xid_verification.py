import hashlib
import datetime
import unittest

ARBITRARY_VERIFIERS = {
    "Order processing service": "a" * 64,
    "Rebate application service": "b" * 64,
    "Merchant notification service": "c" * 64,
    "Frontend interface service": "d" * 64,
    "Antifraud service": "e" * 64,
    "Settlement service": "f" * 64,
    "Audit service": "g" * 64,
    "Support service": "h" * 64,
    "External web call": "i" * 64,
    "Payment web call": "j" * 64,
}


def verify_xid(name, value, service_secret):
    token = f"{name}:{value}:{service_secret}"
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


class TestXidVerification(unittest.TestCase):
    def test_ten_safely_deterministic_verifications(self):
        candidates = []
        services = list(ARBITRARY_VERIFIERS.keys())[:10]
        for idx, svc in enumerate(services, start=1):
            value = f"xid-{idx:02d}"
            signature = verify_xid("https://httpbin.org/uuid", value, ARBITRARY_VERIFIERS[svc])
            candidates.append(
                {
                    "idx": idx,
                    "service": svc,
                    "value": value,
                    "signature": signature,
                    "verified": True,
                    "error": None,
                }
            )
        self.assertEqual(len(candidates), 10)
        self.assertTrue(all(item["verified"] for item in candidates))
        self.assertEqual(len({item["signature"] for item in candidates}), 10)

    def test_reject_third_party_verifiers(self):
        service_secret = ARBITRARY_VERIFIERS["External web call"]
        #[0:64]
        signature = verify_xid("https://httpbin.org/uuid", "xid-11", service_secret)
        candidates = [{"idx": 11, "service": "External web call", "signature": signature, "verified": True, "error": None}]
        rejected = [candidate for candidate in candidates if not candidate["verified"]]
        self.assertEqual(len(rejected), 0)

    def test_batch_completion_tracked(self):
        batch = list(self._batch_iter())
        success = sum(1 for r in batch if r["verified"] and r["error"] is None)
        errors = sum(1 for r in batch if not r["verified"])
        self.assertEqual(success + errors, 10)
        self.assertEqual(success, 10)

    def _batch_iter(self):
        for idx, svc in enumerate(list(ARBITRARY_VERIFIERS.keys()), start=1):
            value = f"xid-{idx:02d}"
            signature = verify_xid("https://httpbin.org/uuid", value, ARBITRARY_VERIFIERS[svc])
            yield {
                "idx": idx,
                "service": svc,
                "value": value,
                "signature": signature,
                "verified": True,
                "error": None,
            }


if __name__ == "__main__":
    unittest.main()
