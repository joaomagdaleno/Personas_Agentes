import unittest
from unittest.mock import MagicMock
import sys

# Mock setup
ctk_mock = MagicMock()
class DummyCanvas:
    def __init__(self, master, **kwargs): pass
    def create_arc(self, *args, **kwargs): pass
    def create_text(self, *args, **kwargs): pass
    def delete(self, *args, **kwargs): pass
ctk_mock.CTkCanvas = DummyCanvas
ctk_mock.CTkFrame = MagicMock
sys.modules["customtkinter"] = ctk_mock

from src_local.interface.components.health_gauge import HealthGauge

class TestHealthGauge(unittest.TestCase):
    def setUp(self):
        self.master = MagicMock()
        self.master._fg_color = ["#000", "#FFF"]
        self.gauge = HealthGauge(self.master)

    def test_set_health(self):
        self.gauge.set_health(150)
        self.assertEqual(self.gauge.health, 100)
    
    def test_colors(self):
        self.assertEqual(self.gauge._get_color(95), "#00ffcc")
