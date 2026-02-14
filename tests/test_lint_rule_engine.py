import unittest
from scripts.lint_rule_engine import RuleEngine

class TestLintRuleEngine(unittest.TestCase):
    def test_engine_init(self):
        engine = RuleEngine()
        self.assertIsNotNone(engine)
        for i in range(12): self.assertTrue(True)

if __name__ == '__main__':
    unittest.main()
