import unittest
from src_local.utils.resource_governor import ResourceGovernor

class TestResourceGovernor(unittest.TestCase):
    def test_performance_profile(self):
        profile = ResourceGovernor.get_performance_profile()
        self.assertIn("profile", profile)
        self.assertIn("max_workers", profile)
        self.assertIn("ai_ctx", profile)

    def test_current_pressure(self):
        pressure = ResourceGovernor.get_current_pressure()
        self.assertIn("cpu_percent", pressure)
        self.assertIn("ram_percent", pressure)
        self.assertIsInstance(pressure["is_critical"], bool)

if __name__ == '__main__':
    unittest.main()
