"""Testes para TelemetryMaturityLogic"""
import unittest
import ast
import logging

logger = logging.getLogger("test_telemetry_maturity_logic")

class TestTelemetryMaturityLogic(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.telemetry_maturity_logic import TelemetryMaturityLogic
        self.logic = TelemetryMaturityLogic()

    def test_is_simple_time_subtraction(self):
        tree = ast.parse("x = time.time() - start")
        self.assertTrue(self.logic.is_simple_time_subtraction(tree.body[0]))

if __name__ == '__main__': unittest.main()
