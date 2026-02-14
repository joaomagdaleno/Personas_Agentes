```python
import unittest
from unittest.mock import MagicMock, patch
from src_local.utils.history_agent import HistoryAgent

class TestHistoryAgent(unittest.TestCase):
    @patch('src_local.utils.history_agent.requests.get')
    def test_fetch_data(self, mock_get):
        mock_get.return_value.json.return_value = {'data': 'test'}
        agent = HistoryAgent()
        result = agent.fetch_data()
        self.assertEqual(result, {'data': 'test'})

if __name__ == '__main__':
    unittest.main()
```