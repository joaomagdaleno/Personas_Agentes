
import unittest
from src_local.agents.Support.penalty_engine import PenaltyEngine

class TestPenaltyEngine(unittest.TestCase):
    def setUp(self):
        self.engine = PenaltyEngine()

    def test_apply_no_penalties(self):
        raw = 100
        result = self.engine.apply(raw, [], {}, 0)
        self.assertEqual(result, 100)

    def test_apply_with_drain(self):
        # Medium alert = 5 drain
        alerts = [{"severity": "medium", "issue": "test"}]
        result = self.engine.apply(100, alerts, {}, 0)
        # Ceiling for medium is 85. Raw 100 -> min(100, 85) = 85. Drain 5 -> 80.
        self.assertEqual(result, 80)

    def test_ceiling_logic(self):
        # High alert ceiling
        alerts = [{"severity": "high", "issue": "test"}]
        ceil = self.engine._calc_ceiling(alerts, 0, 0, 0)
        self.assertEqual(ceil, 60)

if __name__ == '__main__': unittest.main()
