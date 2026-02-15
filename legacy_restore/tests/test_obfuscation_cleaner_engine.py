"""Testes para ObfuscationCleanerEngine"""
import unittest
import ast
import logging
from unittest.mock import MagicMock

logger = logging.getLogger("test_obfuscation_cleaner_engine")

class TestObfuscationCleanerEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.obfuscation_cleaner_engine import ObfuscationCleanerEngine
        self.engine = ObfuscationCleanerEngine()

    def test_collect_replacements(self):
        tree = ast.parse("x = 1")
        hunter = MagicMock()
        hunter.dangerous_keywords = ["eval"]
        result = self.engine.collect_replacements(tree, hunter)
        self.assertIsInstance(result, list)
        
        # Test 2: No replacements
        self.assertEqual(len(result), 0) # No eval in 'x=1'

if __name__ == '__main__': unittest.main()
