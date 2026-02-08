import unittest
import logging
from unittest.mock import MagicMock, patch
from scripts.cleanup_obfuscation import AutoDeobfuscator

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestCleanupObfuscation")

class TestCleanupObfuscation(unittest.TestCase):
    @patch('scripts.cleanup_obfuscation.ObfuscationHunter')
    def test_init(self, mock_h):
        logger.info("⚡ Testando inicialização do AutoDeobfuscator...")
        de = AutoDeobfuscator("root")
        self.assertTrue(mock_h.called)
        logger.info("✅ Inicialização validada.")

if __name__ == '__main__':
    unittest.main()
