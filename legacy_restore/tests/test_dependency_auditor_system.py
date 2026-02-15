import unittest
import os
import logging
from pathlib import Path
from src_local.utils.dependency_auditor import DependencyAuditor

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestDependencyAuditorSystem")

class TestDependencyAuditor(unittest.TestCase):
    def setUp(self):
        self.test_root = Path("temp_sync_test")
        self.test_root.mkdir(exist_ok=True)
        self.auditor = DependencyAuditor(self.test_root)

    def test_lock_mechanism(self):
        logger.info("⚡ Testando mecanismo de lock...")
        # Testa se a trava física é criada e removida corretamente
        self.auditor._acquire_lock()
        self.assertTrue(self.auditor._is_locked())
        self.auditor._release_lock()
        self.assertFalse(self.auditor._is_locked())
        logger.info("✅ Mecanismo de lock validado.")

    def test_invalid_repo_detection(self):
        logger.info("⚡ Testando detecção de repo inválido...")
        # Uma pasta vazia não deve ser considerada um repositório Git válido
        self.assertFalse(self.auditor._is_valid_repo())
        logger.info("✅ Detecção de repo inválido validada.")

    def tearDown(self):
        import shutil
        if self.test_root.exists():
            shutil.rmtree(self.test_root)

if __name__ == "__main__":
    unittest.main()
