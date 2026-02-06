import unittest
from unittest.mock import MagicMock
from src_local.utils.file_system_scanner import FileSystemScanner

class TestFileSystemScanner(unittest.TestCase):
    def test_init(self):
        sc = FileSystemScanner("root", MagicMock())
        self.assertEqual(str(sc.root), "root")

if __name__ == '__main__':
    unittest.main()
