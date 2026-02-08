import unittest
import logging
from pathlib import Path
import sys
import os

# FBI Mode
current_dir = Path(__file__).parent.parent.absolute()
sys.path.insert(0, str(current_dir))

from scripts.git_doctor import GitDoctor

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestGitDoctor")

class TestGitDoctor(unittest.TestCase):
    def setUp(self):
        self.doctor = GitDoctor(current_dir)

    def test_is_protected(self):
        logger.info("⚡ Testando proteção de arquivos...")
        self.assertTrue(self.doctor._is_protected("skills/fast-android-build"))
        self.assertTrue(self.doctor._is_protected("submodules/.agent/skills/skills/fast-android-build/SKILL.md"))
        self.assertFalse(self.doctor._is_protected("src/utils/dummy.py"))
        logger.info("✅ Proteção validada.")

    def test_merge_skills_index_parsing(self):
        logger.info("⚡ Verificando sanidade de merge_skills_index...")
        # Teste básico de sanidade léxica no método de merge
        self.assertTrue(hasattr(self.doctor, '_merge_skills_index'))
        logger.info("✅ Sanidade validada.")

if __name__ == '__main__':
    unittest.main()
