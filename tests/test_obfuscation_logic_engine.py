"""Testes para ObfuscationLogicEngine"""
import unittest
import ast
import logging

logger = logging.getLogger("test_obfuscation_logic_engine")

class TestObfuscationLogicEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.obfuscation_logic_engine import ObfuscationLogicEngine
        self.engine = ObfuscationLogicEngine()

    def test_resolve_constant(self):
        tree = ast.parse("'hello'")
        self.assertEqual(self.engine.resolve_constant(tree.body[0].value), "hello")

if __name__ == '__main__': unittest.main()
