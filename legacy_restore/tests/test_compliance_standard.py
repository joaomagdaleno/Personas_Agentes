import unittest
import logging
from src_local.utils.compliance_standard import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestComplianceStandardModule")

class TestCompliancestandard(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for compliance_standard.py"""
        logger.info("⚡ Iniciando smoke test de compliance_standard.py...")
        # This test ensures the module can be imported and examined.
        self.assertTrue(True)
        logger.info("✅ Smoke test concluído.")

    def test_process_secure_payload_memory(self):
        """Valida o processamento transacional em banco in-memory."""
        logger.info("⚡ Testando conformidade Gold Standard (In-Memory)...")
        from decimal import Decimal
        
        # O ComplianceStandard cria a tabela no :memory:
        result = ComplianceStandard.process_secure_payload('100.0', db_path=":memory:")
        
        # 100 * 1.2 = 120.00
        self.assertEqual(result, Decimal("120.0"))
        
        # Testa erro de valor
        with self.assertRaises(ValueError):
            ComplianceStandard.process_secure_payload('not-a-number', db_path=":memory:")
        logger.info("✅ Conformidade Gold Standard validada.")

if __name__ == "__main__":
    unittest.main()
