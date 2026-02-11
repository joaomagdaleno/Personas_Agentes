"""Testes para ContextMappingLogic"""
import unittest
import logging
from unittest.mock import MagicMock

logger = logging.getLogger("test_context_mapping_logic")

class TestContextMappingLogic(unittest.TestCase):
    def setUp(self):
        from src_local.utils.context_mapping_logic import ContextMappingLogic
        self.logic = ContextMappingLogic()

    def test_get_initial_info(self):
        analyst = MagicMock()
        analyst.map_component_type.return_value = "MODULE"
        result = self.logic.get_initial_info("test.py", "test.py", analyst)
        self.assertEqual(result["path"], "test.py")

if __name__ == '__main__': unittest.main()
