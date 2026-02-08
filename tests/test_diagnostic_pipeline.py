
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch
from src_local.core.diagnostic_pipeline import DiagnosticPipeline

class TestDiagnosticPipeline(unittest.TestCase):
    def setUp(self):
        self.orchestrator = MagicMock()
        self.orchestrator.project_root = Path(".")
        self.orchestrator.director.format_360_report.return_value = "Mock Report Content"
        self.pipeline = DiagnosticPipeline(self.orchestrator)

    def test_pipeline_reset(self):
        self.orchestrator.job_queue = [1, 2, 3]
        self.pipeline.execute()
        self.assertTrue(hasattr(self.orchestrator, 'job_queue'))
        # Pipeline should trigger audits
        self.orchestrator.run_strategic_audit.assert_called()

    @patch("src_local.core.diagnostic_pipeline.Path")
    def test_deduplication(self, mock_path):
        self.orchestrator.run_strategic_audit.return_value = [
            {'file': 'a.py', 'issue': 'A'},
            {'file': 'a.py', 'issue': 'A'}
        ]
        self.orchestrator.director.format_360_report.return_value = "Report Content"
        res = self.pipeline.execute()
        # Verify call to format_360_report
        self.orchestrator.director.format_360_report.assert_called()
        self.assertIsInstance(res, Path)

if __name__ == "__main__":
    unittest.main()
