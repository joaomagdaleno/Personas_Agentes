```python
import unittest
from unittest.mock import MagicMock, patch
from src_local.agents.Support.topology_graph_agent import TopologyGraphAgent

class TestTopologyGraphAgent(unittest.TestCase):
    @patch('src_local.agents.Support.topology_graph_agent.load_graph')
    def test_load_graph(self, mock_load_graph):
        agent = TopologyGraphAgent()
        mock_load_graph.return_value = MagicMock()
        agent.load_graph()
        self.assertTrue(mock_load_graph.called)

if __name__ == '__main__':
    unittest.main()
```