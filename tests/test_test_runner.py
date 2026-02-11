"""Testes para TestRunner"""
import unittest
import logging
from unittest.mock import MagicMock

logger = logging.getLogger("test_test_runner")

class TestTestRunner(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.test_runner import TestRunner
        self.runner = TestRunner()

    def test_run_all(self):
        # Mocking subprocess or internal and checking result structure
        # Since it's a runner, a simple smoke + structure check is standard
        result = self.runner.run_all(r"c:\Users\joaovitormagdaleno\Documents\GitHub\Personas_Agentes\tests")
        self.assertIsInstance(result, dict)
        self.assertIn("total", result)
        self.assertIn("failures", result)

    def test_parse_output(self):
        output = "Ran 10 tests in 0.1s\n\nOK"
        res = self.runner._parse_unittest_output(output)
        self.assertEqual(res["total"], 10)
        self.assertEqual(res["failures"], 0)

if __name__ == '__main__': unittest.main()
