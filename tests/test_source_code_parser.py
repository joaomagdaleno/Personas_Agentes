import unittest
import ast
from src_local.agents.Support.source_code_parser import SourceCodeParser

class TestSourceCodeParser(unittest.TestCase):
    """🧪 Testes Unitários Soberanos para o SourceCodeParser."""

    def setUp(self):
        self.parser = SourceCodeParser()

    def test_analyze_py_anatomy(self):
        """Valida a extração de classes e funções Python."""
        content = "class A: pass\ndef b(): pass"
        res = self.parser.analyze_py(content)
        self.assertIn("A", res["classes"])
        self.assertIn("b", res["functions"])

    def test_analyze_kt_anatomy(self):
        """Valida o parsing heurístico de Kotlin."""
        content = "package com.test\nimport android.os\nclass MainActivity {\nfun onCreate() {}\n}"
        res = self.parser.analyze_kt(content)
        self.assertIn("MainActivity", res["classes"])
        self.assertIn("onCreate", res["functions"])

    def test_complexity_phd(self):
        """Valida o cálculo de complexidade ciclomática."""
        content = "if a: pass\nelif b: pass\nelse: pass"
        tree = ast.parse(content)
        comp = self.parser.calculate_py_complexity(tree)
        self.assertEqual(comp, 3)

if __name__ == "__main__":
    unittest.main()
