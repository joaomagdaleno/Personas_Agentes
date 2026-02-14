```python
import unittest
from unittest.mock import MagicMock
from src_local.utils.memory_pruning_agent import MemoryPruningAgent

class TestMemoryPruningAgent(unittest.TestCase):
    def test_memory_pruning_agent(self):
        # Cria mocks para dependências externas
        memory_pruning_agent = MemoryPruningAgent()
        memory_pruning_agent.memory = MagicMock()
        memory_pruning_agent.memory.prune = MagicMock()
        memory_pruning_agent.memory.prune.return_value = True

        # Chama a função de teste
        result = memory_pruning_agent.prune_memory()

        # Verifica o resultado
        self.assertTrue(result)

if __name__ == '__main__':
    unittest.main()
```