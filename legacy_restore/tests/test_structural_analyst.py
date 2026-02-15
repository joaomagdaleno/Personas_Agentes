import unittest
import logging
from src_local.agents.Support.structural_analyst import StructuralAnalyst

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestStructuralAnalyst")

class TestStructuralAnalyst(unittest.TestCase):
    """🧪 Testes Unitários Soberanos para o StructuralAnalyst."""

    def setUp(self):
        self.analyst = StructuralAnalyst()

    def test_analyze_python_basic(self):
        """Valida a decomposição básica de um arquivo Python."""
        logger.info("⚡ Testando análise básica Python...")
        content = "import os\nclass Main:\n    def run(self): pass"
        res = self.analyst.analyze_python(content, "main.py")
        
        self.assertEqual(len(res["classes"]),
                         1)
        self.assertEqual(res["classes"][0], "Main")
        self.assertIn("os", res["dependencies"])
        logger.info("✅ Análise básica validada.")

    def test_complexity_calculation(self):
        """Garante que a complexidade ciclomática é calculada corretamente."""
        logger.info("⚡ Testando cálculo de complexidade...")
        content = "if a: pass\nfor i in b: pass"
        res = self.analyst.analyze_python(content, "logic.py")
        self.assertGreater(res["complexity"], 1)
        logger.info(f"✅ Complexidade calculada: {res['complexity']}")

if __name__ == "__main__":
    unittest.main()

