import unittest
from pathlib import Path
from src_local.utils.git_client import GitClient

class TestGitClient(unittest.TestCase):
    def test_init(self):
        gc = GitClient(Path("root"))
        self.assertEqual(gc.cwd, Path("root"))

if __name__ == '__main__':
    unittest.main()
