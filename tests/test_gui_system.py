import unittest
from unittest.mock import MagicMock, patch
import tkinter as tk
from src_local.interface.gui import OficinaApp

class TestGUISystem(unittest.TestCase):
    def setUp(self):
        self.root = tk.Tk()
        # Mock do Orquestrador para não disparar auditorias reais
        with patch('src_local.interface.gui.Orchestrator'):
            self.app = OficinaApp(self.root)

    def test_app_initialization(self):
        self.assertEqual(self.root.title(), "Oficina de Software Autônoma 🏛️")
        self.assertIsNotNone(self.app.issues_tree)

    def test_log_message(self):
        test_msg = "Test Log Message"
        self.app.log_message(test_msg)
        # Verifica se a mensagem foi inserida no componente Text
        content = self.app.log_output.get("1.0", tk.END)
        self.assertIn(test_msg, content)

    def tearDown(self):
        self.root.destroy()

if __name__ == "__main__":
    unittest.main()
