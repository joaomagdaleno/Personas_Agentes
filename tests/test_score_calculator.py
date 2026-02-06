import unittest
from src_local.agents.Support.score_calculator import ScoreCalculator

class TestScoreCalculator(unittest.TestCase):
    def test_calculate_final_score(self):
        scorer = ScoreCalculator()
        metrics = {'f1.py': {'has_test': True, 'complexity': 1, 'component_type': 'CODE', 'telemetry': True, 'purpose': 'X'}}
        score = scorer.calculate_final_score(metrics, [])
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)

if __name__ == '__main__':
    unittest.main()
