import unittest
import logging
from src_local.utils.analysis_engine_phd import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestAnalysisEnginePhD")

class TestAnalysisenginephd(unittest.TestCase):
    """
    Suite de testes para o AnalysisEnginePhD.
    Monitorado via telemetria básica de execução.
    """
    def test_analyze_python_file(self):
        """Valida a análise forense de um arquivo Python."""
        logger.info("⚡ Testando análise forense (Python)...")
        from unittest.mock import MagicMock
        from pathlib import Path
        
        mock_analyst = MagicMock()
        mock_analyst.map_component_type.return_value = "CORE"
        mock_analyst.analyze_python.return_value = {"complexity": 10}
        
        mock_guardian = MagicMock()
        mock_guardian.detect_vulnerabilities.return_value = {"vulnerabilities": []}
        
        mock_coverage = MagicMock()
        mock_coverage.detect_test.return_value = True
        
        # Simula um arquivo temporário
        import tempfile
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir) / "test_file.py"
            tmp_path.write_text("def test(): pass", encoding='utf-8')
            
            res = AnalysisEnginePhd.analyze(
                tmp_path, Path(tmp_dir), 
                mock_analyst, mock_guardian, mock_coverage, []
            )
            
            self.assertEqual(res["component_type"], "CORE")
            self.assertEqual(res["complexity"], 10)
            self.assertFalse(res["brittle"])
            self.assertEqual(res["test_depth"]["quality_level"], "NONE") # Não é arquivo de teste
            
            import os
            os.unlink(tmp_path)
        logger.info("✅ Análise Python validada.")

    def test_test_quality_deep(self):
        """Valida a detecção de profundidade em arquivos de teste."""
        logger.info("⚡ Testando detecção de qualidade de teste (DEEP)...")
        info = {"component_type": "TEST"}
        content = """
        def test_fn():
            self.assertEqual(1, 1)
            self.assertTrue(True)
            self.assertIn("a", "abc")
            assert x == y
            self.assertRaises(ValueError, fn)
            expect(a).toBe(b)
        """
        # 6 asserções no total
        AnalysisEnginePhd._test_quality(content, info)
        self.assertEqual(info["test_depth"]["assertion_count"], 6)
        self.assertEqual(info["test_depth"]["quality_level"], "DEEP")
        logger.info("✅ Qualidade de teste validada.")

if __name__ == "__main__":
    unittest.main()
