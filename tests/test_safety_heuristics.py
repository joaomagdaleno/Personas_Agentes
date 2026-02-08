import unittest
import logging
from src_local.agents.Support.safety_heuristics import *

# Configuração de telemetria
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestSafety_heuristics")

class TestSafetyheuristics(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for safety_heuristics.py"""
        logger.info("⚡ Iniciando smoke test para safety_heuristics.py...")
        self.assertTrue(True)
        logger.info("✅ Smoke test concluído.")

if __name__ == "__main__":
    unittest.main()
