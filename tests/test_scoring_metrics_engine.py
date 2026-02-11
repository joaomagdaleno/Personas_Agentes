
import unittest
from src_local.agents.Support.scoring_metrics_engine import ScoringMetricsEngine

class TestScoringMetricsEngine(unittest.TestCase):
    def setUp(self):
        self.engine = ScoringMetricsEngine()

    def test_calc_stability(self):
        map_data = {
            "a.py": {"component_type": "CORE", "has_test": True},
            "b.py": {"component_type": "TEST", "has_test": False}
        }
        score, tests, relevant = self.engine.calc_stability(map_data)
        self.assertEqual(score, 40)
        self.assertEqual(tests, 1)
        self.assertEqual(relevant, 1)

    def test_calc_purity(self):
        map_data = {"a.py": {"complexity": 5}}
        score, avg = self.engine.calc_purity(map_data, 1)
        self.assertEqual(score, 20)
        self.assertEqual(avg, 5)

    def test_calc_observability(self):
        map_data = {"a.py": {"component_type": "CORE", "telemetry": True}}
        score, tel, rel = self.engine.calc_observability(map_data)
        self.assertEqual(score, 15)

if __name__ == '__main__': unittest.main()
