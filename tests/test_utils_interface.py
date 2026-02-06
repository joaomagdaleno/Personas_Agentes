import unittest
from unittest.mock import MagicMock, patch
from pathlib import Path
from src_local.utils.update_transaction import UpdateTransaction
from src_local.utils.file_system_scanner import FileSystemScanner

class TestUtilsInterface(unittest.TestCase):
    @patch('src_local.interface.cli.Orchestrator')
    @patch('sys.argv', ['cli.py'])
    def test_cli_main_no_args(self, mock_orch):
        from src_local.interface.cli import main
        # Se executar sem erro, ok
        main()
        self.assertTrue(mock_orch.called)

    def test_update_transaction_init(self):
        mock_git = MagicMock()
        transaction = UpdateTransaction(mock_git, "root")
        self.assertEqual(transaction.git, mock_git)
        self.assertEqual(transaction.root, "root")

    def test_file_system_scanner_init(self):
        mock_analyst = MagicMock()
        scanner = FileSystemScanner("root", mock_analyst)
        self.assertEqual(scanner.analyst, mock_analyst)

    def test_git_client_initialization(self):
        from src_local.utils.git_client import GitClient
        client = GitClient(Path("repo_dir"))
        self.assertEqual(client.cwd, Path("repo_dir"))

    @patch('scripts.cleanup_obfuscation.ObfuscationHunter')
    def test_auto_deobfuscator_init(self, mock_hunter):
        from scripts.cleanup_obfuscation import AutoDeobfuscator
        deobf = AutoDeobfuscator("root")
        self.assertEqual(deobf.project_root, Path("root"))

if __name__ == '__main__':
    unittest.main()
