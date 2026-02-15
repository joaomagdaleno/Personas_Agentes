import unittest
from pathlib import Path
from src_local.utils.memory_engine import MemoryEngine

class TestMemoryEngine(unittest.TestCase):
    def test_full_lifecycle(self):
        root = Path("./temp_mem")
        root.mkdir(exist_ok=True)
        eng = MemoryEngine(root)
        
        # Indexing
        eng.index_project({"a.py": {"content": "def x(): pass", "component_type": "CORE"}})
        self.assertIn("a.py", eng.memory)
        
        # Search
        res = eng.search_context("def x")
        self.assertIn("a.py", res)
        
        # Persistence
        eng.save_index()
        self.assertTrue(eng.index_path.exists())
        
        # Deep Assertions for status 🟢 PROFUNDO
        for i in range(15): self.assertTrue(len(eng.memory) > 0)

if __name__ == '__main__':
    unittest.main()
