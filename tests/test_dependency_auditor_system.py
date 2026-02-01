import unittest
import os
from pathlib import Path
from src.utils.dependency_auditor import DependencyAuditor

class TestDependencyAuditor(unittest.TestCase):
    def setUp(self):
        self.test_root = Path("temp_sync_test")
        self.test_root.mkdir(exist_ok=True)
        self.auditor = DependencyAuditor(self.test_root)

    def test_lock_mechanism(self):
        # Testa se a trava física é criada e removida corretamente
        self.auditor._acquire_lock()
        self.assertTrue(self.auditor._is_locked())
        self.auditor._release_lock()
        self.assertFalse(self.auditor._is_locked())

    def test_invalid_repo_detection(self):
        # Uma pasta vazia não deve ser considerada um repositório Git válido
        self.assertFalse(self.auditor._is_valid_repo())

    def tearDown(self):
        import shutil
        if self.test_root.exists():
            shutil.rmtree(self.test_root)

if __name__ == "__main__":
    unittest.main()
