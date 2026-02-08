import unittest
import logging
from src_local.agents.Support.dna_profiler import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestDNAProfiler")

class TestDnaprofiler(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for dna_profiler.py"""
        logger.info("⚡ Iniciando smoke test de DNAProfiler...")
        # This test ensures the module can be imported and examined.
        self.assertTrue(True)
        logger.info("✅ Smoke test concluído.")

if __name__ == "__main__":
    unittest.main()
