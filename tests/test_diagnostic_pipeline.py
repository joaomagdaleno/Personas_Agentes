import unittest
from unittest.mock import MagicMock, patch
from src_local.core.diagnostic_pipeline import DiagnosticPipeline

class TestDiagnosticPipeline(unittest.TestCase):
    def setUp(self):
        self.orc = MagicMock()
        self.pipeline = DiagnosticPipeline(self.orc)

    def test_init_state(self):
        self.assertFalse(DiagnosticPipeline._is_running)
        self.assertIsNotNone(self.pipeline.deduplicator)
        self.assertEqual(self.pipeline.orc, self.orc)

    def test_reset_logic(self):
        self.orc.metrics = {"all_findings": [1, 2]}
        self.orc.job_queue = [1, 2, 3]
        self.orc.personas = ["PhD"]
        self.pipeline._reset_system()
        self.assertEqual(self.orc.job_queue, [])
        self.assertEqual(self.orc.metrics["all_findings"], [])
        self.assertEqual(self.orc.personas, ["PhD"]) # Não deve resetar personas se já existem

    def test_recursion_guard_and_state(self):
        DiagnosticPipeline._is_running = True
        res = self.pipeline.execute()
        self.assertEqual(res.name, "recursion_prevented.md")
        self.assertTrue(DiagnosticPipeline._is_running)
        DiagnosticPipeline._is_running = False
        self.assertFalse(DiagnosticPipeline._is_running)

if __name__ == '__main__':
    unittest.main()
