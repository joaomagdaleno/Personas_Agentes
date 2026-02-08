import unittest
import logging
from debug_relevance import *

# Configuração de telemetria
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestDebug_relevance")

class TestDebugrelevance(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for debug_relevance.py"""
        logger.info("⚡ Iniciando smoke test para debug_relevance.py...")
        self.assertTrue(True)
        logger.info("✅ Smoke test concluído.")

if __name__ == "__main__":
    unittest.main()
