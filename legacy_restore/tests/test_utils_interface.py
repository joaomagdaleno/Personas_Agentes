import unittest
import logging
from unittest.mock import MagicMock, patch
from pathlib import Path
from src_local.utils.update_transaction import UpdateTransaction
from src_local.utils.file_system_scanner import FileSystemScanner

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestUtilsInterface")

class TestUtilsInterface(unittest.TestCase):
    @patch('src_local.interface.cli.Orchestrator')
    @patch('sys.argv', ['cli.py'])
    def test_cli_main_no_args(self, mock_orch):
        logger.info("⚡ Testando CLI main sem argumentos...")
        from src_local.interface.cli import main
        # Se executar sem erro, ok
        main()
        self.assertTrue(mock_orch.called)
        logger.info("✅ CLI validada.")

    def test_update_transaction_init(self):
        logger.info("⚡ Testando inicialização de transação...")
        mock_git = MagicMock()
        transaction = UpdateTransaction(mock_git, "root")
        self.assertEqual(transaction.git, mock_git)
        self.assertEqual(transaction.root, "root")
        logger.info("✅ Transação validada.")

    def test_file_system_scanner_init(self):
        logger.info("⚡ Testando inicialização de scanner...")
        mock_analyst = MagicMock()
        scanner = FileSystemScanner("root", mock_analyst)
        self.assertEqual(scanner.analyst, mock_analyst)
        logger.info("✅ Scanner validado.")

    def test_git_client_initialization(self):
        logger.info("⚡ Testando inicialização de GitClient...")
        from src_local.utils.git_client import GitClient
        client = GitClient(Path("repo_dir"))
        self.assertEqual(client.cwd, Path("repo_dir"))
        logger.info("✅ GitClient validado.")

    @patch('scripts.cleanup_obfuscation.ObfuscationHunter')
    def test_auto_deobfuscator_init(self, mock_hunter):
        logger.info("⚡ Testando inicialização de AutoDeobfuscator...")
        from scripts.cleanup_obfuscation import AutoDeobfuscator
        deobf = AutoDeobfuscator("root")
        self.assertEqual(deobf.project_root, Path("root"))
        logger.info("✅ AutoDeobfuscator validado.")

if __name__ == '__main__':
    unittest.main()
