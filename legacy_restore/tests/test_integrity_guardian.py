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

    def test_error_silencing_detection(self):
        """Valida a detecção de silenciamento de erros sem telemetria."""
        logger.info("⚡ Testando detecção de silenciamento de erros...")
        guardian = IntegrityGuardian()
        
        # 1. Caso de Risco: Silenciamento absoluto sem nada
        content_risky = "try:\n    do_something()\nexcept:\n    pass"
        issues = guardian.detect_vulnerabilities(content_risky, "PRODUCTION", ignore_test_context=True)
        self.assertTrue(issues['silent_error'])
        
        # 2. Caso Seguro: Silenciamento com telemetria
        content_safe = "try:\n    do_something()\nexcept:\n    logger.error('failed')\n    pass"
        issues = guardian.detect_vulnerabilities(content_safe, "PRODUCTION", ignore_test_context=True)
        self.assertFalse(issues['silent_error'])
        
        # 3. Caso Técnico: Definição de padrão (pelo LogicAuditor)
        content_tech = "DANGEROUS = 'except.*:\\\\s*pass'"
        issues = guardian.detect_vulnerabilities(content_tech, "PRODUCTION", ignore_test_context=True)
        self.assertFalse(issues['silent_error'])
        
        logger.info("✅ Detecção de silenciamento de erros validada.")

if __name__ == '__main__':
    unittest.main()
