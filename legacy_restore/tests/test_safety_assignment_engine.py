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

        result = self.engine.is_in_metadata_assignment([tree.body[0]], tree.body[0].value, utils, {"config"})
        self.assertTrue(result)
        
        # Test 2: Attribute assignment
        tree2 = ast.parse("self.config = 'val'")
        node2 = tree2.body[0]
        result2 = self.engine.is_in_metadata_assignment([node2], node2.value, utils, {"config"})
        self.assertTrue(result2)

if __name__ == '__main__': unittest.main()
