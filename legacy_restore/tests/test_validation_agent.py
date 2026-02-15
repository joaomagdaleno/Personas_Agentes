import unittest
from unittest.mock import MagicMock
from src_local.agents.Support.validation_agent import ValidationAgent

class TestValidationAgent(unittest.TestCase):
    def test_fallback(self):
        agent = ValidationAgent(MagicMock())
        res = agent._fast_fallback()
        self.assertTrue(res["success"])

if __name__ == '__main__':
    unittest.main()
