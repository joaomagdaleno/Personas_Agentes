import unittest
import logging
from unittest.mock import MagicMock, patch
import tkinter as tk
from src_local.interface.gui import OficinaApp

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestGUISystem")

class TestGUISystem(unittest.TestCase):
    def setUp(self):
        self.root = tk.Tk()
        # Mock do Orquestrador para não disparar auditorias reais
        with patch('src_local.interface.gui.Orchestrator'):
            self.app = OficinaApp(self.root)

    def test_app_initialization(self):
        logger.info("⚡ Testando inicialização da GUI...")
        self.assertEqual(self.root.title(), "Oficina de Software Autônoma 🏛️")
        self.assertIsNotNone(self.app.issues_tree)
        logger.info("✅ Inicialização validada.")

    def test_log_message(self):
        logger.info("⚡ Testando log de mensagens na GUI...")
        test_msg = "Test Log Message"
        self.app.log_message(test_msg)
        # Verifica se a mensagem foi inserida no componente Text
        content = self.app.log_output.get("1.0", tk.END)
        self.assertIn(test_msg, content)
        logger.info("✅ Log de mensagens validado.")

    def tearDown(self):
        self.root.destroy()

if __name__ == "__main__":
    unittest.main()
