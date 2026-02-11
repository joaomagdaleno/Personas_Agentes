"""Testes para ASTNodeInspector - Proxy para test_delegation_engines.py"""
import unittest
import ast
import logging

logger = logging.getLogger("test_ast_node_inspector")

class TestASTNodeInspector(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.ast_node_inspector import ASTNodeInspector
        self.inspector = ASTNodeInspector()

    def test_is_descendant(self):
        logger.info("⚡ Validando is_descendant...")
        tree = ast.parse("x = 1 + 2")
        self.assertTrue(self.inspector.is_descendant(tree.body[0].value, tree))
        self.assertFalse(self.inspector.is_descendant(ast.parse("y=2").body[0], tree))

    def test_is_call_to(self):
        logger.info("⚡ Validando is_call_to...")
        tree = ast.parse("eval('x')")
        self.assertTrue(self.inspector.is_call_to(tree.body[0].value, ["eval"]))
        self.assertFalse(self.inspector.is_call_to(tree.body[0].value, ["exec"]))

if __name__ == '__main__': unittest.main()
