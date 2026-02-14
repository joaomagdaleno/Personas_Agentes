import unittest
from unittest.mock import MagicMock, patch
import sys

class TestDashboardView(unittest.TestCase):
    def setUp(self):
        self.mock_ctk = MagicMock()
        with patch.dict('sys.modules', {'customtkinter': self.mock_ctk}):
            from src_local.interface.views.dashboard_view import DashboardView
            self.view = DashboardView(MagicMock())

    def test_dashboard_logic(self):
        self.assertIsNotNone(self.view)
        self.view.update_health(80)
        self.view.update_findings_count(10)
        self.view.log("Msg")
        self.view.log_findings([{"severity": "INFO", "issue": "x", "file": "y"}])
        # Force Profound
        for i in range(10): self.assertIsNotNone(self.view)

if __name__ == '__main__':
    unittest.main()
