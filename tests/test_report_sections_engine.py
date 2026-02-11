"""Testes para ReportSectionsEngine"""
import unittest
import logging

logger = logging.getLogger("test_report_sections_engine")

class TestReportSectionsEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.report_sections_engine import ReportSectionsEngine
        self.engine = ReportSectionsEngine()

    def test_format_vitals_table(self):
        data = {"dark_matter": [], "brittle_points": []}
        result = self.engine.format_vitals_table(data, "Paridade", "OK")
        self.assertIn("Pontos Cegos", result)

if __name__ == '__main__': unittest.main()
