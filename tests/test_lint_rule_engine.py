"""Testes para LintRuleEngine"""
import unittest
import logging

logger = logging.getLogger("test_lint_rule_engine")

class TestLintRuleEngine(unittest.TestCase):
    def setUp(self):
        from scripts.lint_rule_engine import LintRuleEngine
        self.engine = LintRuleEngine()

    def test_verify_rules(self):
        lines = ["# Title", "", "Paragraph."]
        errors = self.engine.verify_rules(lines)
        self.assertIsInstance(errors, list)
        
        # Test 2: No errors in clean content
        self.assertEqual(len(errors), 0)

if __name__ == '__main__': unittest.main()
