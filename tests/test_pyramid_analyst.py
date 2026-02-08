import unittest
import logging
from src_local.agents.Support.pyramid_analyst import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestPyramidAnalyst")

class TestPyramidanalyst(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for pyramid_analyst.py"""
        logger.info("⚡ Iniciando smoke test de PyramidAnalyst...")
        # This test ensures the module can be imported and examined.
        self.assertTrue(True)
        logger.info("✅ Smoke test concluído.")

if __name__ == "__main__":
    unittest.main()
