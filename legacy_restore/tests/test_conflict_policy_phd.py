import unittest
import logging
from src_local.utils.conflict_policy_phd import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestConflictPolicyPhD")

class TestConflictpolicyphd(unittest.TestCase):
    def test_resolve_cache(self):
        """Valida a resolução de conflitos de cache (remoção)."""
        logger.info("⚡ Testando resolução de cache...")
        from unittest.mock import MagicMock
        from pathlib import Path
        import tempfile
        
        mock_git = MagicMock()
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            cache_file = "old_cache.pyc"
            (tmp_path / cache_file).touch()
            
            policy = ConflictPolicyPhd(tmp_path, mock_git)
            success = policy.resolve_file(cache_file, MagicMock(), MagicMock())
            
            self.assertTrue(success)
            mock_git.assert_called_with(["rm", "--cached", cache_file])
            self.assertFalse((tmp_path / cache_file).exists())
        logger.info("✅ Resolução de cache validada.")

    def test_resolve_ours_protected(self):
        """Valida a resolução 'ours' para arquivos protegidos."""
        logger.info("⚡ Testando resolução de arquivo protegido...")
        from unittest.mock import MagicMock
        mock_git = MagicMock()
        policy = ConflictPolicyPhd(Path("."), mock_git)
        
        is_protected = lambda f: f == "config.py"
        success = policy.resolve_file("config.py", MagicMock(), is_protected)
        
        self.assertTrue(success)
        mock_git.assert_any_call(["checkout", "--ours", "config.py"])
        mock_git.assert_any_call(["add", "config.py"])
        logger.info("✅ Resolução de arquivo protegido validada.")

    def test_resolve_json_merge_success(self):
        """Valida resoluções JSON com merge bem-sucedido."""
        logger.info("⚡ Testando merge JSON bem-sucedido...")
        from unittest.mock import MagicMock
        mock_git = MagicMock()
        policy = ConflictPolicyPhd(Path("."), mock_git)
        
        mock_merge = MagicMock(return_value=True)
        success = policy.resolve_file("skills_index.json", mock_merge, lambda f: False)
        
        self.assertTrue(success)
        mock_merge.assert_called_with("skills_index.json")
        mock_git.assert_called_with(["add", "skills_index.json"])
        logger.info("✅ Merge JSON validado.")

if __name__ == "__main__":
    unittest.main()
