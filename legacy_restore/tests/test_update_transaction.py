import unittest
import logging
from unittest.mock import MagicMock
from src_local.utils.update_transaction import UpdateTransaction

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestUpdateTransaction")

class TestUpdateTransaction(unittest.TestCase):
    def test_execute_success(self):
        """Valida a execução bem-sucedida da transação."""
        logger.info("⚡ Testando execução de transação (sucesso)...")
        mock_git = MagicMock()
        mock_git.discover_remote.return_value = "origin"
        mock_git.get_commit_count.return_value = 5 # 5 commits atrás
        mock_git.rebase.return_value.returncode = 0
        
        import tempfile
        from pathlib import Path
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            mock_git.cwd = tmp_path
            tx = UpdateTransaction(mock_git, tmp_path)
            success = tx.execute("hash123")
            
            self.assertTrue(success)
            self.assertTrue(mock_git.fetch_prune.called)
            self.assertTrue(mock_git.rebase.called)
            logger.info("✅ Transação de sucesso validada.")


    def test_rollback_on_failure(self):
        """Valida o rollback em caso de falha crítica."""
        logger.info("⚡ Testando rollback em falha...")
        mock_git = MagicMock()
        mock_git.discover_remote.side_effect = Exception("Falha simulada")
        
        tx = UpdateTransaction(mock_git, "root")
        success = tx.execute("initial_hash")
        
        self.assertFalse(success)
        self.assertTrue(mock_git.reset_hard.called)
        mock_git.reset_hard.assert_called_with("initial_hash")
        logger.info("✅ Rollback validado.")

    def test_integrity_check_failure(self):
        """Valida se a transação falha se a integridade do código for violada."""
        logger.info("⚡ Testando quebra de integridade...")
        mock_git = MagicMock()
        mock_git.discover_remote.return_value = "origin"
        mock_git.get_commit_count.return_value = 1
        mock_git.rebase.return_value.returncode = 0
        
        import tempfile
        from pathlib import Path
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            mock_git.cwd = tmp_path
            # Cria um arquivo Python com erro de sintaxe
            (tmp_path / "broken.py").write_text("if True:", encoding='utf-8')
            
            tx = UpdateTransaction(mock_git, tmp_path)
            success = tx.execute("hash")
            self.assertFalse(success)
            logger.info("✅ Falha de integridade validada.")

if __name__ == '__main__':
    unittest.main()
