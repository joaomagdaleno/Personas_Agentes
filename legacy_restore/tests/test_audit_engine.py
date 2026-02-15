import unittest
from unittest.mock import MagicMock, patch
from src_local.core.audit_engine import AuditEngine

class TestAuditEngine(unittest.TestCase):
    def setUp(self):
        from pathlib import Path
        self.orc = MagicMock()
        self.orc.project_root = Path("/tmp")
        self.engine = AuditEngine(self.orc)

    def test_run_strategic_audit_structure(self):
        context = {
            'identity': {'stacks': {'Python'}},
            'map': {}
        }
        with patch.object(self.engine.task_orc, 'run_audit_cycle', return_value=[]):
            with patch.object(self.engine, '_detect_changes', return_value={}):
                findings, start_t = self.engine.run_strategic_audit(context)
                self.assertIsInstance(findings, list)
                self.assertIsInstance(start_t, float)

    def test_scan_single_file_empty(self):
        mock_hunter = MagicMock()
        mock_hunter.scan_file.return_value = []
        res = self.engine._scan_single_file(mock_hunter, "test.py", {"content": ""})
        self.assertEqual(res, [])

if __name__ == '__main__':
    unittest.main()
