"""Testes para SafetyAssignmentEngine"""
import unittest
import ast
import logging
from unittest.mock import MagicMock

logger = logging.getLogger("test_safety_assignment_engine")

class TestSafetyAssignmentEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.safety_assignment_engine import SafetyAssignmentEngine
        self.engine = SafetyAssignmentEngine()

    def test_is_in_metadata_assignment(self):
        tree = ast.parse("config = 'val'")
        utils = MagicMock()
        utils.is_in_dict_value.return_value = False
        result = self.engine.is_in_metadata_assignment([tree.body[0]], tree.body[0].value, utils, {"config"})
        self.assertTrue(result)

if __name__ == '__main__': unittest.main()
