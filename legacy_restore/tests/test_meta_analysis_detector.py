import unittest
import ast
from src_local.agents.Support.meta_analysis_detector import MetaAnalysisDetector

class TestMetaAnalysisDetector(unittest.TestCase):
    def setUp(self):
        self.detector = MetaAnalysisDetector()

    def test_isinstance_ast_check(self):
        code = "isinstance(node, ast.Global)"
        node = ast.parse(code).body[0].value
        self.assertTrue(self.detector.is_meta_analysis_node(node))

    def test_regex_call(self):
        code = "re.search(r'\\d+', text)"
        node = ast.parse(code).body[0].value
        self.assertTrue(self.detector.is_meta_analysis_node(node))

    def test_normal_call(self):
        code = "print('hello')"
        node = ast.parse(code).body[0].value
        self.assertFalse(self.detector.is_meta_analysis_node(node))

if __name__ == '__main__':
    unittest.main()
