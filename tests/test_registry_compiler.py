import unittest
import logging
from src_local.agents.Support.registry_compiler import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestRegistryCompiler")

class TestRegistrycompiler(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for registry_compiler.py"""
        logger.info("⚡ Iniciando smoke test de RegistryCompiler...")
        # This test ensures the module can be imported and examined.
        self.assertTrue(True)
        logger.info("✅ Smoke test concluído.")

if __name__ == "__main__":
    unittest.main()
