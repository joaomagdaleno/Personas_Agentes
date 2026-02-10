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

    def test_cli_audit_command(self):
        """Valida a execução do comando 'audit' via CLI."""
        logger.info("⚡ Testando comando 'audit' da CLI...")
        from unittest.mock import patch, MagicMock
        import sys
        
        with patch("sys.argv", ["cli.py", "audit"]):
            with patch("src_local.core.orchestrator.Orchestrator.generate_full_diagnostic") as mock_diag:
                mock_diag.return_value = MagicMock(name="report.md")
                from src_local.interface.cli import main
                try:
                    main()
                except SystemExit:
                    pass
                self.assertTrue(mock_diag.called)
        logger.info("✅ Comando 'audit' validado.")

    def test_cli_unknown_command(self):
        """Valida o tratamento de comandos desconhecidos na CLI."""
        logger.info("⚡ Testando comando desconhecido na CLI...")
        from unittest.mock import patch
        import sys
        
        with patch("sys.argv", ["cli.py", "ghost"]):
            from src_local.interface.cli import main
            # O main não levanta SystemExit para comandos desconhecidos, apenas loga erro
            main()
            self.assertTrue(True) # Se chegou aqui sem crash, passou
        logger.info("✅ Tratamento de comando desconhecido validado.")

if __name__ == '__main__':
    unittest.main()
