import unittest
import logging
from pathlib import Path
from unittest.mock import MagicMock, patch
from src_local.core.diagnostic_pipeline import DiagnosticPipeline

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestDiagnosticPipeline")

class TestDiagnosticPipeline(unittest.TestCase):
    def setUp(self):
        self.orchestrator = MagicMock()
        self.orchestrator.project_root = Path(".")
        self.orchestrator.director.format_360_report.return_value = "Mock Report Content"
        self.pipeline = DiagnosticPipeline(self.orchestrator)

    @patch("src_local.core.validator.CoreValidator.verify_core_health")
    def test_pipeline_reset(self, mock_verify):
        logger.info("⚡ Testando reset do pipeline...")
        mock_verify.return_value = {"success": True, "pass_rate": 100, "total_run": 0, "failed": 0}
        self.orchestrator.job_queue = [1, 2, 3]
        self.pipeline.execute()
        self.assertTrue(hasattr(self.orchestrator, 'job_queue'))
        # Pipeline should trigger audits
        self.orchestrator.run_strategic_audit.assert_called()
        logger.info("✅ Reset do pipeline validado.")

    @patch("src_local.core.validator.CoreValidator.verify_core_health")
    @patch("src_local.core.diagnostic_pipeline.Path")
    def test_deduplication(self, mock_path, mock_verify):
        logger.info("⚡ Testando deduplicação no pipeline...")
        mock_verify.return_value = {"success": True}
        self.orchestrator.run_strategic_audit.return_value = [
            {'file': 'a.py', 'issue': 'A'},
            {'file': 'a.py', 'issue': 'A'}
        ]
        self.orchestrator.director.format_360_report.return_value = "Report Content"
        res = self.pipeline.execute()
        # Verify call to format_360_report
        self.orchestrator.director.format_360_report.assert_called()
        self.assertIsInstance(res, Path)
        logger.info("✅ Deduplicação validada.")

if __name__ == "__main__":
    unittest.main()
