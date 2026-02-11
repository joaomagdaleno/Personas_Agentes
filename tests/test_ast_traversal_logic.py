"""Testes para ASTTraversalLogic"""
import unittest
import ast
import logging

logger = logging.getLogger("test_ast_traversal_logic")

class TestASTTraversalLogic(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.ast_traversal_logic import ASTTraversalLogic
        self.logic = ASTTraversalLogic()

    def test_get_parent_chain(self):
        tree = ast.parse("x = eval('y')")
        chain = self.logic.get_parent_chain(tree.body[0].value, tree)
        self.assertTrue(len(chain) >= 1)

    def test_is_in_dict_value(self):
        tree = ast.parse("d = {'name': eval('x')}")
        d = tree.body[0].value
        self.assertTrue(self.logic.is_in_dict_value(d, d.values[0], ["name"], self.logic))

if __name__ == '__main__': unittest.main()
