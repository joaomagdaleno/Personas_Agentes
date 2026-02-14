```python
import unittest
from unittest.mock import patch, Mock
from src_local.agents.Support.briefing_agent import BriefingAgent

class TestBriefingAgent(unittest.TestCase):
    @patch('src_local.agents.Support.briefing_agent.DependencyClass')
    def test_init(self, mock_dependency):
        agent = BriefingAgent(mock_dependency)
        self.assertEqual(mock_dependency, agent.dependency)

if __name__ == '__main__':
    unittest.main()
```