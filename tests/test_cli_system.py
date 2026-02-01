import unittest
from unittest.mock import patch, MagicMock
from src.interface.cli import main

class TestCLISystem(unittest.TestCase):
    @patch('src.interface.cli.Orchestrator')
    @patch('sys.argv', ['cli.py'])
    def test_cli_no_args(self, mock_orch):
        # Apenas garante que não crasha sem argumentos
        with patch('builtins.print') as mock_print:
            main()
            mock_print.assert_any_call("🏛️ Workshop PhD CLI")

    @patch('src.interface.cli.Orchestrator')
    @patch('sys.argv', ['cli.py', 'audit'])
    def test_cli_audit_command(self, mock_orch_class):
        mock_instance = mock_orch_class.return_value
        mock_instance.run_phd_audit.return_value = []
        
        main()
        mock_instance.run_phd_audit.assert_called_once()

if __name__ == "__main__":
    unittest.main()
