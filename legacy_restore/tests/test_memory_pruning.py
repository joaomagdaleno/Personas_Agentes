import unittest
from src_local.utils.memory_pruning_agent import MemoryPruningAgent
from pathlib import Path

class TestMemoryPruning(unittest.TestCase):
    def test_init(self):
        agent = MemoryPruningAgent(".")
        self.assertTrue(agent.db_path.name.endswith(".db"))

if __name__ == '__main__':
    unittest.main()
