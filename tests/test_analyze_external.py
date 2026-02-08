import unittest
import logging
from scripts.analyze_external import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestAnalyzeExternal")

class TestAnalyzeexternal(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for analyze_external.py"""
        logger.info("⚡ Iniciando smoke test de AnalyzeExternal...")
        # This test ensures the module can be imported and examined.
        self.assertTrue(True)
        logger.info("✅ Smoke test concluído.")

if __name__ == "__main__":
    unittest.main()
