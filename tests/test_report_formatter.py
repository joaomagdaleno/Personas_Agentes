import unittest
import logging
from src_local.agents.Support.report_formatter import ReportFormatter

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestReportFormatter")

class TestReportFormatter(unittest.TestCase):
    def test_format_header(self):
        logger.info("⚡ Testando formatação de cabeçalho de relatório...")
        fmt = ReportFormatter()
        res = fmt.format_header({'objective': 'Obs', 'health_score': 10, 'total_issues': 1})
        self.assertIn("Obs", res)
        logger.info("✅ Cabeçalho validado.")

if __name__ == '__main__':
    unittest.main()
