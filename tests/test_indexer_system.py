import unittest
from pathlib import Path
from src.utils.indexer import Indexer

class TestIndexer(unittest.TestCase):
    def setUp(self):
        self.test_root = Path("temp_indexer_test")
        self.test_root.mkdir(exist_ok=True)
        self.indexer = Indexer(self.test_root)

    def test_metadata_extraction(self):
        dummy_file = self.test_root / "dummy.py"
        dummy_file.write_text("class MyClass:\n    def my_func(): pass")
        
        index = self.indexer.update_index()
        rel_path = "dummy.py"
        
        self.assertIn(rel_path, index["files"])
        self.assertIn("MyClass", index["files"][rel_path]["classes"])
        self.assertIn("my_func", index["files"][rel_path]["functions"])

    def tearDown(self):
        import shutil
        if self.test_root.exists():
            shutil.rmtree(self.test_root)

if __name__ == "__main__":
    unittest.main()
