import unittest
from unittest.mock import MagicMock
import customtkinter as ctk

# Mock ctk to avoid GUI spawning during tests
ctk.CTkFrame = MagicMock()
ctk.CTkLabel = MagicMock()
ctk.CTkButton = MagicMock()
ctk.CTkEntry = MagicMock()
ctk.CTkTextbox = MagicMock()
ctk.CTkScrollableFrame = MagicMock()
ctk.CTkRadioButton = MagicMock()

from src_local.interface.components.sidebar import SidebarComponent
from src_local.interface.views.dashboard_view import DashboardView
from src_local.interface.views.findings_view import FindingsView
from src_local.interface.views.chat_view import ChatView

class TestComponentsSmoke(unittest.TestCase):
    def setUp(self):
        self.master = MagicMock()
        self.callbacks = {
            'run_audit': MagicMock(),
            'open_report': MagicMock(),
            'auto_heal': MagicMock(),
            'show_dashboard': MagicMock(),
            'show_findings': MagicMock(),
            'show_chat': MagicMock(),
            'copy_fix': MagicMock(),
            'send_chat': MagicMock()
        }

    def test_sidebar_init(self):
        sidebar = SidebarComponent(self.master, self.callbacks)
        self.assertIsNotNone(sidebar)

    def test_dashboard_view_init(self):
        view = DashboardView(self.master)
        self.assertIsNotNone(view)
        view.update_health(90)
        view.update_findings_count(5)

    def test_findings_view_init(self):
        view = FindingsView(self.master, self.callbacks)
        self.assertIsNotNone(view)
        view.refresh_findings([{'severity': 'CRITICAL', 'file': 'test.py', 'issue': 'Bug'}])

    def test_chat_view_init(self):
        view = ChatView(self.master, self.callbacks)
        self.assertIsNotNone(view)
        view.add_message("Test")

if __name__ == '__main__':
    unittest.main()
