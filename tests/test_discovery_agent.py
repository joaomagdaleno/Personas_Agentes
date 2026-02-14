import unittest
from unittest.mock import MagicMock
from src_local.agents.Support.discovery_agent import DiscoveryAgent

class TestDiscoveryAgent(unittest.TestCase):
    def test_init(self):
        orc = MagicMock()
        agent = DiscoveryAgent(orc)
        self.assertEqual(agent.orc, orc)

if __name__ == '__main__':
    unittest.main()
