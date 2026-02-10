import unittest
import logging
from unittest.mock import MagicMock
from pathlib import Path
from src_local.utils.file_system_scanner import FileSystemScanner

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestFileSystemScanner")

class TestFileSystemScanner(unittest.TestCase):
    def test_scan_all_filenames(self):
        """Valida a descoberta plana de nomes de arquivos."""
        logger.info("⚡ Testando descoberta plana de arquivos...")
        import tempfile
        from pathlib import Path
        
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            (tmp_path / "a.py").write_text("", encoding='utf-8')
            (tmp_path / "B.TXT").write_text("", encoding='utf-8')
            
            sc = FileSystemScanner(tmp_path, MagicMock())
            files = sc.scan_all_filenames()
            
            self.assertIn("a.py", files)
            self.assertIn("b.txt", files) # Lowercase check
            logger.info("✅ Descoberta validada.")

    def test_should_skip(self):
        """Valida o filtro de arquivos ignorados (pruning)."""
        logger.info("⚡ Testando regras de exclusão (skip)...")
        import tempfile
        from pathlib import Path
        
        mock_analyst = MagicMock()
        mock_analyst.should_ignore.return_value = False
        mock_analyst.is_analyable.return_value = True
        
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            sc = FileSystemScanner(tmp_path, mock_analyst)
            
            # Criar arquivos físicos para que is_file() retorne True
            gemini_file = tmp_path / ".gemini" / "config.json"
            gemini_file.parent.mkdir()
            gemini_file.write_text("{}")
            
            pycache_file = tmp_path / "__pycache__" / "f.pyc"
            pycache_file.parent.mkdir()
            pycache_file.write_text("")
            
            normal_file = tmp_path / "src_local" / "core.py"
            normal_file.parent.mkdir()
            normal_file.write_text("")
            
            # Pasta gemini deve ser pulada
            self.assertTrue(sc._should_skip(gemini_file))
            # Pasta pycache deve ser pulada
            self.assertTrue(sc._should_skip(pycache_file))
            # Arquivo normal não deve ser pulado
            self.assertFalse(sc._should_skip(normal_file))
            logger.info("✅ Regras de exclusão validadas.")

    def test_get_analyzable_files(self):
        """Valida o gerador de arquivos para análise."""
        logger.info("⚡ Testando gerador de arquivos analisáveis...")
        import tempfile
        from pathlib import Path
        
        mock_analyst = MagicMock()
        mock_analyst.should_ignore.return_value = False
        mock_analyst.is_analyable.return_value = True
        
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            src_dir = tmp_path / "src_local"
            src_dir.mkdir()
            (src_dir / "valid.py").write_text("", encoding='utf-8')
            (tmp_path / ".git").mkdir()
            (tmp_path / ".git" / "config").write_text("", encoding='utf-8')
            
            sc = FileSystemScanner(tmp_path, mock_analyst)
            files = list(sc.get_analyzable_files())
            
            filenames = [f.name for f in files]
            self.assertIn("valid.py", filenames)
            self.assertNotIn("config", filenames)
            logger.info("✅ Gerador de arquivos validado.")

if __name__ == '__main__':
    unittest.main()
