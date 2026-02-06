import unittest
import ast
from src_local.agents.Support.ast_navigator import ASTNavigator

class TestASTNavigator(unittest.TestCase):
    def setUp(self):
        self.nav = ASTNavigator()

    def test_is_call_to(self):
        tree = ast.parse("eval('1+1')")
        node = tree.body[0].value
        self.assertTrue(self.nav.is_call_to(node, ["eval"]))
        self.assertFalse(self.nav.is_call_to(node, ["print"]))

if __name__ == '__main__':
    unittest.main()
