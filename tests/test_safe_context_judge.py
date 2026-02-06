import unittest
import ast
from src_local.agents.Support.safe_context_judge import SafeContextJudge

class TestSafeContextJudge(unittest.TestCase):
    def setUp(self):
        self.judge = SafeContextJudge()

    def test_is_node_safe_in_rules(self):
        content = "audit_rules = [{'regex': 'eval'}]"
        tree = ast.parse(content)
        for node in ast.walk(tree):
            if isinstance(node, ast.Constant) and node.value == 'eval':
                self.assertTrue(self.judge.is_node_safe(node, tree))

    def test_is_node_safe_in_test_function(self):
        content = "def test_eval(): eval('1+1')"
        tree = ast.parse(content)
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and getattr(node.func, 'id', '') == 'eval':
                self.assertTrue(self.judge.is_node_safe(node, tree))

if __name__ == '__main__':
    unittest.main()
