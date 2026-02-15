import unittest
import logging
from unittest.mock import MagicMock
from src_local.agents.Support.report_formatter import ReportFormatter

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestReportFormatter")

class TestReportFormatter(unittest.TestCase):
    def test_format_vitals(self):
        """Valida a consolidação dos sinais vitais."""
        logger.info("⚡ Testando formatação de sinais vitais...")
        fmt = ReportFormatter()
        data = {
            'health_score': 80,
            'dark_matter': ['file1.py'],
            'brittle_points': ['test1.py'],
            'parity': {'gaps': []}
        }
        res = fmt.format_vitals(data)
        self.assertIn("1 Arquivos", res)
        self.assertIn("1 Pontos", res)
        self.assertIn("Sincronizada", res)
        logger.info("✅ Sinais vitais validados.")

    def test_format_quality_matrix(self):
        """Valida a formatação da matriz de confiança."""
        logger.info("⚡ Testando formatação da matriz de confiança...")
        fmt = ReportFormatter()
        data = {
            'test_quality_matrix': [
                {'file': 'core.py', 'complexity': 10, 'assertions': 5, 'test_status': 'DEEP'},
                {'file': 'util.py', 'complexity': 10, 'assertions': 1, 'test_status': 'SHALLOW'}
            ]
        }
        res = fmt.format_quality_matrix(data)
        self.assertIn("🟢 PROFUNDO", res)
        self.assertIn("🔴 FRÁGIL", res)
        self.assertIn("core.py", res)
        logger.info("✅ Matriz de confiança validada.")

    def test_format_obfuscation_zone(self):
        """Valida a formatação da zona de ofuscação."""
        logger.info("⚡ Testando formatação do Codex Obscurus...")
        fmt = ReportFormatter()
        findings = [{'file': 'x.py', 'line': 10, 'issue': 'eval detected', 'snippet': 'eval("foo")'}]
        res = fmt.format_obfuscation_zone(findings)
        logger.info(f"DEBUG Formatter output: {res}")
        self.assertIn("Análise de Ofuscação", res)
        self.assertIn("x_py", res)
        logger.info("✅ Zona de ofuscação validada.")

if __name__ == '__main__':
    unittest.main()
