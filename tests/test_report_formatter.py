import unittest
from src_local.agents.Support.report_formatter import ReportFormatter

class TestReportFormatter(unittest.TestCase):
    def test_format_header(self):
        fmt = ReportFormatter()
        res = fmt.format_header({'objective': 'Obs', 'health_score': 10, 'total_issues': 1})
        self.assertIn("Obs", res)

if __name__ == '__main__':
    unittest.main()
