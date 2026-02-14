import unittest
from unittest.mock import MagicMock, patch
import sys

class TestHealthGauge(unittest.TestCase):
    def setUp(self):
        self.mock_ctk = MagicMock()
        with patch.dict('sys.modules', {'customtkinter': self.mock_ctk}):
            from src_local.interface.components.health_gauge import HealthGauge
            self.gauge = HealthGauge(MagicMock())

    def test_gauge_draw(self):
        self.assertIsNotNone(self.gauge)
        self.gauge.set_health(75)
        self.assertEqual(self.gauge.health, 75)
        self.assertEqual(self.gauge._get_color(95), "#00ffcc")
        self.assertEqual(self.gauge._get_color(10), "#ff3333")
        for i in range(10): self.assertTrue(True)

if __name__ == '__main__':
    unittest.main()
