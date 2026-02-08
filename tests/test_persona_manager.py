import unittest
import logging
from scripts.persona_manager import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestPersonaManager")

class TestPersonamanager(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for persona_manager.py"""
        logger.info("⚡ Iniciando smoke test de PersonaManager...")
        # This test ensures the module can be imported and examined.
        self.assertTrue(True)
        logger.info("✅ Smoke test concluído.")

if __name__ == "__main__":
    unittest.main()
