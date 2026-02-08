import unittest
import logging
from unittest.mock import MagicMock
from src_local.utils.update_transaction import UpdateTransaction

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestUpdateTransaction")

class TestUpdateTransaction(unittest.TestCase):
    def test_init(self):
        logger.info("⚡ Testando inicialização da transação de update...")
        mock_git = MagicMock()
        tx = UpdateTransaction(mock_git, "root")
        self.assertEqual(tx.git, mock_git)
        logger.info("✅ Inicialização validada.")

if __name__ == '__main__':
    unittest.main()
