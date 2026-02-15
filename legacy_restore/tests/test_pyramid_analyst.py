import unittest
import logging
from src_local.agents.Support.pyramid_analyst import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestPyramidAnalyst")

class TestPyramidanalyst(unittest.TestCase):
    def test_analyze_distribution(self):
        """Valida a classificação da pirâmide de testes."""
        logger.info("⚡ Testando pirâmide de testes...")
        analyst = PyramidAnalyst()
        map_data = {
            "tests/unit_test.py": {},
            "tests/integration_test.py": {},
            "tests/e2e_test.py": {}
        }
        
        def mock_read(file):
            if "unit" in file: return "def test(): pass"
            if "integration" in file: return "import mock\nwith patch(): pass"
            if "e2e" in file: return "from selenium import webdriver"
            return ""
            
        pyramid = analyst.analyze(map_data, mock_read)
        self.assertEqual(pyramid["unit"], 1)
        self.assertEqual(pyramid["integration"], 1)
        self.assertEqual(pyramid["e2e"], 1)
        self.assertEqual(pyramid["total"], 3)
        logger.info("✅ Pirâmide de testes validada.")

if __name__ == "__main__":
    unittest.main()
