import unittest
import logging
from pathlib import Path
from src_local.utils.git_client import GitClient

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestGitClient")

class TestGitClient(unittest.TestCase):
    def test_init(self):
        logger.info("⚡ Testando inicialização do GitClient...")
        gc = GitClient(Path("root"))
        self.assertEqual(gc.cwd, Path("root"))
        logger.info("✅ Inicialização validada.")

if __name__ == '__main__':
    unittest.main()
