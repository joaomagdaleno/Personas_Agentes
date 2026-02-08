import unittest
import logging
from src_local.agents.Support.memory_persistence import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestMemoryPersistence")

class TestMemorypersistence(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for memory_persistence.py"""
        logger.info("⚡ Iniciando smoke test de MemoryPersistence...")
        # This test ensures the module can be imported and examined.
        self.assertTrue(True)
        logger.info("✅ Smoke test concluído.")

if __name__ == "__main__":
    unittest.main()
