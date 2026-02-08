import unittest
import logging
from src_local.agents.Support.silent_error_detector import *

# Configuração de telemetria
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestSilent_error_detector")

class TestSilenterrordetector(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for silent_error_detector.py"""
        logger.info("⚡ Iniciando smoke test para silent_error_detector.py...")
        self.assertTrue(True)
        logger.info("✅ Smoke test concluído.")

if __name__ == "__main__":
    unittest.main()
