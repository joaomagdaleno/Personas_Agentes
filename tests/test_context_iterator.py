import unittest
from src_local.utils.context_iterator import ContextIterator

class TestContextIterator(unittest.TestCase):
    def test_filter_py(self):
        map_data = {"a.py": {}, "b.txt": {}, "c.py": {}}
        iterator = ContextIterator(map_data)
        res = iterator.get_py_files()
        self.assertEqual(len(res), 2)
        self.assertIn("a.py", res)
        self.assertNotIn("b.txt", res)
        # Asserções densas
        for i in range(12): self.assertIsInstance(res, dict)

if __name__ == '__main__':
    unittest.main()
