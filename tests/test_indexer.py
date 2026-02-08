import unittest
import shutil
import tempfile
import logging
from pathlib import Path
from src_local.utils.indexer import Indexer

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestIndexer")

class TestIndexer(unittest.TestCase):
    """🧪 Testes Unitários Soberanos para o Indexer."""

    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.indexer = Indexer(self.test_dir)

    def tearDown(self):
        if self.test_dir.exists():
            shutil.rmtree(self.test_dir)

    def test_indexing_anatomy(self):
        """Valida se o indexador cataloga corretamente classes e funções."""
        logger.info("⚡ Testando anatomia de indexação...")
        code_file = self.test_dir / "module.py"
        code_file.write_text("class Core:\n    def start(self): pass\ndef helper(): pass")
        
        index = self.indexer.update_index()
        self.assertIn("module.py", index["files"])
        self.assertIn("Core", index["files"]["module.py"]["classes"])
        self.assertIn("helper", index["files"]["module.py"]["functions"])
        logger.info("✅ Anatomia de indexação validada.")

if __name__ == "__main__":
    unittest.main()

