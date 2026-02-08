import unittest
import ast
import logging
from src_local.agents.Support.source_code_parser import SourceCodeParser

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestSourceCodeParser")

class TestSourceCodeParser(unittest.TestCase):
    """🧪 Testes Unitários Soberanos para o SourceCodeParser."""

    def setUp(self):
        self.parser = SourceCodeParser()

    def test_analyze_py_anatomy(self):
        """Valida a extração de classes e funções Python."""
        logger.info("⚡ Testando anatomia Python...")
        content = "class A: pass\ndef b(): pass"
        res = self.parser.analyze_py(content)
        self.assertIn("A", res["classes"])
        self.assertIn("b", res["functions"])
        logger.info("✅ Anatomia Python validada.")

    def test_analyze_kt_anatomy(self):
        """Valida o parsing heurístico de Kotlin."""
        logger.info("⚡ Testando anatomia Kotlin...")
        content = "package com.test\nimport android.os\nclass MainActivity {\nfun onCreate() {}\n}"
        res = self.parser.analyze_kt(content)
        self.assertIn("MainActivity", res["classes"])
        self.assertIn("onCreate", res["functions"])
        logger.info("✅ Anatomia Kotlin validada.")

    def test_complexity_phd(self):
        """Valida o cálculo de complexidade ciclomática."""
        logger.info("⚡ Testando cálculo de complexidade...")
        content = "if a: pass\nelif b: pass\nelse: pass"
        tree = ast.parse(content)
        comp = self.parser.calculate_py_complexity(tree)
        self.assertEqual(comp, 3)
        logger.info("✅ Complexidade validada.")

if __name__ == "__main__":
    unittest.main()
