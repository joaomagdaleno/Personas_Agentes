import unittest
import logging
from unittest.mock import MagicMock
from src_local.utils.file_system_scanner import FileSystemScanner

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestFileSystemScanner")

class TestFileSystemScanner(unittest.TestCase):
    def test_init(self):
        logger.info("⚡ Testando inicialização do FileSystemScanner...")
        sc = FileSystemScanner("root", MagicMock())
        self.assertEqual(str(sc.root), "root")
        logger.info("✅ Inicialização validada.")

if __name__ == '__main__':
    unittest.main()
