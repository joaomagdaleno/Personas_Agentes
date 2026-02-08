import unittest
import json
import logging
from pathlib import Path
from src_local.utils.cache_manager import CacheManager

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestCacheManagerSystem")

class TestCacheManager(unittest.TestCase):
    def setUp(self):
        # Usa um diretório temporário para testes
        self.test_root = Path("temp_test_env")
        self.test_root.mkdir(exist_ok=True)
        self.cache_manager = CacheManager(self.test_root)

    def test_hash_generation(self):
        logger.info("⚡ Testando geração de hash...")
        test_file = self.test_root / "test.txt"
        test_file.write_text("hello world")
        h = self.cache_manager.get_file_hash(test_file)
        self.assertIsInstance(h, str)
        self.assertTrue(len(h) > 0)
        logger.info("✅ Geração de hash validada.")

    def test_update_and_save(self):
        logger.info("⚡ Testando update e save...")
        self.cache_manager.update("file.py", "hash123")
        self.cache_manager.save()
        
        # Verifica se o arquivo foi criado fisicamente
        cache_path = self.test_root / ".gemini" / "cache" / "audit_cache.json"
        self.assertTrue(cache_path.exists())
        
        # Verifica conteúdo
        data = json.loads(cache_path.read_text())
        self.assertEqual(data["file.py"], "hash123")
        logger.info("✅ Update e save validados.")

    def tearDown(self):
        # Limpeza básica do ambiente de teste
        import shutil
        if self.test_root.exists():
            shutil.rmtree(self.test_root)

if __name__ == "__main__":
    unittest.main()
