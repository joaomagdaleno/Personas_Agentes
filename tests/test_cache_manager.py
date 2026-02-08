import unittest
import shutil
import tempfile
import logging
from pathlib import Path
from src_local.utils.cache_manager import CacheManager

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestCacheManager")

class TestCacheManager(unittest.TestCase):
    """🧪 Testes Unitários Soberanos para o CacheManager."""

    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.cache = CacheManager(self.test_dir)

    def tearDown(self):
        if self.test_dir.exists():
            shutil.rmtree(self.test_dir)

    def test_hashing_and_change_detection(self):
        """Valida a geração de hash e detecção de mudanças atômicas."""
        logger.info("⚡ Testando detecção de mudanças...")
        test_file = self.test_dir / "app.py"
        test_file.write_text("print('hello')")
        
        h1 = self.cache.get_file_hash(test_file)
        self.assertGreater(len(h1), 0)
        
        # Simula mudança
        test_file.write_text("print('world')")
        h2 = self.cache.get_file_hash(test_file)
        self.assertNotEqual(h1, h2)
        logger.info("✅ Detecção de mudanças validada.")

    def test_save_load_cycle(self):
        """Valida a persistência da memória do cache no disco."""
        logger.info("⚡ Testando ciclo de persistência...")
        self.cache.update("main.py", "hash123")
        self.cache.save()
        
        # Recarrega
        new_cache = CacheManager(self.test_dir)
        self.assertEqual(new_cache.current_cache.get("main.py"), "hash123")
        logger.info("✅ Persistência validada.")

if __name__ == "__main__":
    unittest.main()
