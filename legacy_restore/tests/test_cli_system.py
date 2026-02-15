import unittest
from unittest.mock import patch, MagicMock
from src_local.interface.cli import main

class TestCLISystem(unittest.TestCase):
    @patch('src_local.interface.cli.Orchestrator')
    @patch('src_local.interface.cli.logger')
    @patch('sys.argv', ['cli.py'])
    def test_cli_no_args(self, mock_logger, mock_orch):
        # Apenas garante que não crasha sem argumentos
        main()
        mock_logger.info.assert_any_call("🏛️ Workshop PhD CLI: Operacional")

    @patch('src_local.interface.cli.Orchestrator')
    @patch('sys.argv', ['cli.py', 'audit'])
    def test_cli_audit_command(self, mock_orch_class):
        mock_instance = mock_orch_class.return_value
        mock_instance.generate_full_diagnostic.return_value = MagicMock(name="report.md")
        
        main()
        mock_instance.generate_full_diagnostic.assert_called_once()

if __name__ == "__main__":
    unittest.main()
