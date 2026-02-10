import unittest
import logging
from src_local.agents.Support.coverage_auditor import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestCoverageAuditor")

class TestCoverageauditor(unittest.TestCase):
    def test_detect_test_logic(self):
        """Valida a detecção semântica de arquivos de teste."""
        logger.info("⚡ Testando detecção de cobertura...")
        from pathlib import Path
        auditor = CoverageAuditor()
        all_files = ["test_core.py", "test_utils.py", "main.py"]
        
        # Caso Positivo
        self.assertTrue(auditor.detect_test(Path("core.py"), "CORE", all_files))
        # Caso Negativo
        self.assertFalse(auditor.detect_test(Path("logic.py"), "LOGIC", all_files))
        # Isenções
        self.assertTrue(auditor.detect_test(Path("test_core.py"), "TEST", all_files))
        self.assertTrue(auditor.detect_test(Path("__init__.py"), "UTIL", all_files))
        
        logger.info("✅ Lógica de cobertura validada.")

if __name__ == "__main__":
    unittest.main()
