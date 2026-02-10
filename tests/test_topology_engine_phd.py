import unittest
import logging
from src_local.utils.topology_engine_phd import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestTopologyEnginePhD")

class TestTopologyenginephd(unittest.TestCase):
    def test_discover_files(self):
        """Valida a descoberta recursiva de arquivos."""
        logger.info("⚡ Testando descoberta de arquivos...")
        from pathlib import Path
        import tempfile
        
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            (tmp_path / "a.py").touch()
            (tmp_path / "sub").mkdir()
            (tmp_path / "sub" / "b.py").touch()
            
            files = TopologyEnginePhd.discover_files(tmp_path)
            self.assertIn("a.py", files)
            self.assertIn("b.py", files)
        logger.info("✅ Descoberta de arquivos validada.")

    def test_should_process_logic(self):
        """Valida a lógica de filtragem de território."""
        logger.info("⚡ Testando lógica de processamento de território...")
        from unittest.mock import MagicMock
        from pathlib import Path
        
        mock_analyst = MagicMock()
        mock_analyst.should_ignore.return_value = False
        mock_analyst.is_analyable.return_value = True
        
        project_root = Path("/fake/root")
        target_path = project_root / "src_local" / "file.py"
        
        # Simula arquivo novo (não está no map_data)
        can_process = TopologyEnginePhd.should_process(target_path, project_root, mock_analyst, {})
        self.assertEqual(can_process, "src_local/file.py")
        
        # Simula arquivo ignorado (e fora de src_local)
        mock_analyst.should_ignore.return_value = True
        ext_path = project_root / "external" / "file.py"
        self.assertFalse(TopologyEnginePhd.should_process(ext_path, project_root, mock_analyst, {}))
        logger.info("✅ Lógica de processamento validada.")

if __name__ == "__main__":
    unittest.main()
