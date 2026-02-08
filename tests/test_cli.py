import unittest
import logging
from unittest.mock import MagicMock, patch
from src_local.interface.cli import main

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestCLI")

class TestCLI(unittest.TestCase):
    @patch('src_local.interface.cli.Orchestrator')
    @patch('sys.argv', ['cli.py'])
    def test_main(self, mock_orch):
        logger.info("⚡ Testando ponto de entrada CLI...")
        main()
        self.assertTrue(mock_orch.called)
        logger.info("✅ CLI validada.")

if __name__ == '__main__':
    unittest.main()
