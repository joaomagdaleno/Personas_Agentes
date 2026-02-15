
import unittest
from src_local.agents.Support.test_navigator import TestNavigator

class TestTestNavigator(unittest.TestCase):
    def setUp(self):
        self.navigator = TestNavigator()

    def test_find_tests_for_files(self):
        # Smoke test for discovery logic
        res = self.navigator.find_tests_for_files([])
        self.assertIsInstance(res, dict)

if __name__ == '__main__': unittest.main()
