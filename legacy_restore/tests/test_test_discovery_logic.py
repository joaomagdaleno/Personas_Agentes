
import unittest
from src_local.agents.Support.test_discovery_logic import TestDiscoveryLogic

class TestTestDiscoveryLogic(unittest.TestCase):
    def setUp(self):
        self.logic = TestDiscoveryLogic()

    def test_get_metrics(self):
        # Smoke check
        res = self.logic.get_metrics({})
        self.assertIsInstance(res, dict)

if __name__ == '__main__': unittest.main()
