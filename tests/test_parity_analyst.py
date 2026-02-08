import unittest
import logging
from src_local.agents.Support.parity_analyst import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestParityAnalyst")

class TestParityanalyst(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for parity_analyst.py"""
        logger.info("⚡ Iniciando smoke test de ParityAnalyst...")
        # This test ensures the module can be imported and examined.
        self.assertTrue(True)
        logger.info("✅ Smoke test concluído.")

if __name__ == "__main__":
    unittest.main()
