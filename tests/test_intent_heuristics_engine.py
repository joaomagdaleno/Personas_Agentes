"""Testes para IntentHeuristicsEngine"""
import unittest
import ast
import logging
from unittest.mock import MagicMock

logger = logging.getLogger("test_intent_heuristics_engine")

class TestIntentHeuristicsEngine(unittest.TestCase):
    def test_metadata_context(self):
        from src_local.agents.Support.intent_heuristics_engine import IntentHeuristicsEngine
        engine = IntentHeuristicsEngine()
        heuristics = MagicMock()
        heuristics.is_meta_analysis_node.return_value = True
        tree = ast.parse("x = 1")
        self.assertTrue(engine.is_metadata_context(tree.body[0], tree, heuristics))

    def test_analysis_comparison(self):
        from src_local.agents.Support.intent_heuristics_engine import IntentHeuristicsEngine
        engine = IntentHeuristicsEngine()
        tree = ast.parse("'test' in data")
        self.assertIsInstance(engine._is_analysis_comparison(tree.body[0].value), bool)

if __name__ == '__main__': unittest.main()
