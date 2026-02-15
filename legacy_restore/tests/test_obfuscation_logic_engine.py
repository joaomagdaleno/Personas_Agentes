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
        
        # Test 2: Concat resolution
        tree2 = ast.parse("'he' + 'llo'")
        self.assertEqual(self.engine.resolve_constant(tree2.body[0].value), "hello")
        # Test 3: Deep concat
        tree3 = ast.parse("'a' + 'b' + 'c'")
        self.assertEqual(self.engine.resolve_constant(tree3.body[0].value), "abc")

if __name__ == '__main__': unittest.main()
