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
        # Mocking subprocess para evitar recursão infinita no i5
        import subprocess
        from unittest.mock import patch
        
        mock_res = MagicMock()
        mock_res.returncode = 0
        mock_res.stderr = "Ran 5 tests\nOK"
        
        with patch('subprocess.run', return_value=mock_res):
            result = self.runner.run_unittest_discover(r".")
            self.assertIsInstance(result, dict)
            self.assertIn("total_run", result)
            self.assertIn("failed", result)

    def test_parse_output(self):
        output = "Ran 10 tests in 0.1s\n\nOK"
        res = self.runner._parse_output(output, True)
        self.assertEqual(res["total_run"], 10)
        self.assertEqual(res["failed"], 0)

if __name__ == '__main__': unittest.main()
