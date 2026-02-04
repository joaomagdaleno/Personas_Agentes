import unittest
from pathlib import Path
import sys
import os

# FBI Mode
current_dir = Path(__file__).parent.parent.absolute()
sys.path.insert(0, str(current_dir))

from scripts.git_doctor import GitDoctor

class TestGitDoctor(unittest.TestCase):
    def setUp(self):
        self.doctor = GitDoctor(current_dir)

    def test_is_protected(self):
        self.assertTrue(self.doctor._is_protected("skills/fast-android-build"))
        self.assertTrue(self.doctor._is_protected("submodules/.agent/skills/skills/fast-android-build/SKILL.md"))
        self.assertFalse(self.doctor._is_protected("src/utils/dummy.py"))

    def test_merge_skills_index_parsing(self):
        # Teste básico de sanidade léxica no método de merge
        # Mocking run_command would be better but this verifies the import and class structure
        self.assertTrue(hasattr(self.doctor, '_merge_skills_index'))

if __name__ == '__main__':
    unittest.main()
