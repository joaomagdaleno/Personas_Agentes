"""Testes para LintHeadingLogic"""
import unittest
import logging

logger = logging.getLogger("test_lint_heading_logic")

class TestLintHeadingLogic(unittest.TestCase):
    def setUp(self):
        from scripts.lint_heading_logic import LintHeadingLogic
        self.logic = LintHeadingLogic()

    def test_check_headings(self):
        lines = ["", "# Title", ""]
        errors = self.logic.check_headings(lines, 1, "# Title", {})
        self.assertEqual(len(errors), 0)
        
        # Test 2: Invalid heading
        errors2 = self.logic.check_headings(lines, 1, "Title", {})
        self.assertTrue(len(errors2) > 0)

if __name__ == '__main__': unittest.main()
