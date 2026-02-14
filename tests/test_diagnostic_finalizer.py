import unittest
from unittest.mock import MagicMock, patch
from src_local.core.diagnostic_finalizer import DiagnosticFinalizer

class TestFinalizer(unittest.TestCase):
    def test_run_ai_analysis_empty(self):
        orc = MagicMock()
        findings = []
        DiagnosticFinalizer._run_ai_analysis(orc, findings)
        self.assertEqual(findings, [])

    def test_persist_report_suppression(self):
        with patch.dict('os.environ', {'DIAGNOSTIC_TEST_MODE': '1'}):
            orc = MagicMock()
            res = DiagnosticFinalizer._persist_report(orc, {}, [])
            self.assertEqual(res.name, "test_report_suppressed.md")

if __name__ == '__main__':
    unittest.main()
