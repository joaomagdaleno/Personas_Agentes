import unittest
import logging
from src_local.utils.maintenance_engine_phd import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestMaintenanceEnginePhD")

class TestMaintenanceenginephd(unittest.TestCase):
    def test_clean_submodules(self):
        """Valida a limpeza recursiva de submodulos."""
        logger.info("⚡ Testando limpeza de submodulos...")
        from unittest.mock import MagicMock, patch
        from pathlib import Path
        
        mock_run_git = MagicMock()
        mock_run_git.return_value.returncode = 0
        mock_run_git.return_value.stdout = "sub1\nsub2"
        
        import tempfile
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            (root / ".gitmodules").touch()
            (root / "sub1").mkdir()
            (root / "sub2").mkdir()
            
            with patch("subprocess.run") as mock_sub:
                MaintenanceEnginePhd.clean_submodules(root, mock_run_git)
                self.assertEqual(mock_sub.call_count, 2)
                mock_sub.assert_any_call(["git", "clean", "-fd"], cwd=str(root / "sub1"), capture_output=True)
        logger.info("✅ Limpeza de submodulos validada.")

    def test_merge_skills_index(self):
        """Valida o merge inteligente do índice de skills."""
        logger.info("⚡ Testando merge de índice de skills...")
        import tempfile
        from unittest.mock import MagicMock
        from pathlib import Path
        import json
        
        mock_run_git = MagicMock()
        # Item 1 protegido em 'ours' (index 2), Item 2 em 'theirs' (index 3)
        mock_run_git.side_effect = [
            MagicMock(stdout=json.dumps([{"id": "skill_1", "val": "ours"}])), # ours
            MagicMock(stdout=json.dumps([{"id": "skill_2", "val": "theirs"}])) # theirs
        ]
        
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            file_path = "skills.json"
            protected_ids = ["skill_1"]
            
            success = MaintenanceEnginePhd.merge_skills_index(root, file_path, mock_run_git, protected_ids)
            
            self.assertTrue(success)
            with open(root / file_path, "r", encoding="utf-8") as f:
                merged = json.load(f)
                ids = [i["id"] for i in merged]
                self.assertIn("skill_1", ids)
                self.assertIn("skill_2", ids)
                # Verifica se preservou o valor do item protegido
                s1 = next(i for i in merged if i["id"] == "skill_1")
                self.assertEqual(s1["val"], "ours")
        logger.info("✅ Merge de skills validado.")

if __name__ == "__main__":
    unittest.main()
