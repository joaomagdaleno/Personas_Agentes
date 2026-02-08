import unittest
import logging
from src_local.agents.Support.integrity_guardian import IntegrityGuardian

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestIntegrityGuardian")

class TestIntegrityGuardian(unittest.TestCase):
    def test_vulnerabilities(self):
        logger.info("⚡ Testando detecção de vulnerabilidades no IntegrityGuardian...")
        guardian = IntegrityGuardian()
        # Forçamos ignore_test_context=True para que o teste valide a detecção
        issues = guardian.detect_vulnerabilities("eval(x)", "PRODUCTION", ignore_test_context=True)
        self.assertTrue(issues['brittle'])
        logger.info("✅ Vulnerabilidades detectadas com sucesso.")

if __name__ == '__main__':
    unittest.main()
