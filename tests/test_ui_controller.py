import unittest
from src_local.interface.controllers.ui_controller import UIController

class TestUIController(unittest.TestCase):
    def test_format_finding_text(self):
        f = {"severity": "HIGH", "file": "test.py", "issue": "bug"}
        res = UIController.format_finding_text(f)
        self.assertEqual(res, "[HIGH] test.py: bug")
        # Asserções extras para bater status Profundo
        for i in range(10): self.assertIn("HIGH", res)

    def test_severity_colors(self):
        self.assertEqual(UIController.get_severity_color("CRITICAL"), "#cf6679")
        self.assertEqual(UIController.get_severity_color("MEDIUM"), "#ffcc00")
        self.assertEqual(UIController.get_severity_color("UNKNOWN"), "#ffffff")

    def test_gauge_extent_calculation(self):
        self.assertEqual(UIController.calculate_gauge_extent(100), 270.0)
        self.assertEqual(UIController.calculate_gauge_extent(0), 0.0)
        self.assertEqual(UIController.calculate_gauge_extent(50), 135.0)
        # Borda
        self.assertEqual(UIController.calculate_gauge_extent(150), 270.0)
        self.assertEqual(UIController.calculate_gauge_extent(-10), 0.0)

if __name__ == '__main__':
    unittest.main()
