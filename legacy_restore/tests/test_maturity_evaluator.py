import unittest
from src_local.agents.Support.maturity_evaluator import MaturityEvaluator

class TestMaturityEvaluatorDeep(unittest.TestCase):
    def setUp(self):
        self.evaluator = MaturityEvaluator()

    def test_calculate_maturity_profound(self):
        # Código com evidências PhD
        code = """
import time
import pathlib
from pathlib import Path
def _reason_about_objective():
    start = time.time()
    rules = [1, 2, 3]
    _log_performance(start)
"""
        res = self.evaluator.calculate_maturity(code, "Python")
        self.assertEqual(res["level"], "PROFUNDO")
        self.assertTrue(res["has_telemetry"])
        self.assertTrue(res["has_pathlib"])
        self.assertTrue(res["is_linear_syntax"])

    def test_calculate_maturity_fragile(self):
        code = "print('hello')"
        res = self.evaluator.calculate_maturity(code, "Python")
        self.assertEqual(res["level"], "FRÁGIL")
        self.assertFalse(res["has_telemetry"])

if __name__ == '__main__':
    unittest.main()
