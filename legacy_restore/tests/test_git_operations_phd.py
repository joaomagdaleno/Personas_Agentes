import unittest
import logging
from src_local.utils.git_operations_phd import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestGitOperationsPhD")

class TestGitoperationsphd(unittest.TestCase):
    def test_discover_remote(self):
        """Valida a descoberta de remotos upstream/origin."""
        logger.info("⚡ Testando descoberta de remotos Git...")
        from unittest.mock import MagicMock, patch
        from pathlib import Path
        
        with patch("src_local.utils.git_operations_phd.GitOperationsPhd.run_git_out") as mock_out:
            mock_out.return_value = "origin\nupstream"
            with patch("subprocess.run") as mock_run:
                mock_run.return_value.returncode = 0
                
                remote = GitOperationsPhd.discover_remote(Path("."))
                self.assertEqual(remote, "upstream") # Prioridade upstream
        logger.info("✅ Descoberta de remoto validada.")

    def test_get_topology(self):
        """Valida a extração de topologia de branch."""
        logger.info("⚡ Testando extração de topologia Git...")
        from unittest.mock import patch
        from pathlib import Path
        
        with patch("src_local.utils.git_operations_phd.GitOperationsPhd.run_git_out") as mock_out:
            mock_out.side_effect = ["feature-branch", "refs/heads/main"]
            
            topology = GitOperationsPhd.get_topology(Path("."))
            self.assertEqual(topology['active_ref'], "feature-branch")
            self.assertEqual(topology['tracking_ref'], "main")
        logger.info("✅ Topologia validada.")

    def test_transactional_rollback(self):
        """Valida o rollback de transação Git."""
        logger.info("⚡ Testando rollback transacional...")
        from unittest.mock import patch
        from pathlib import Path
        
        with patch("subprocess.run") as mock_run:
            GitOperationsPhd.transactional_rollback(Path("."), "hash123")
            self.assertEqual(mock_run.call_count, 2)
            mock_run.assert_any_call(["git", "rebase", "--abort"], cwd=Path("."), capture_output=True)
            mock_run.assert_any_call(["git", "reset", "--hard", "hash123"], cwd=Path("."), capture_output=True)
        logger.info("✅ Rollback validado.")

if __name__ == "__main__":
    unittest.main()
