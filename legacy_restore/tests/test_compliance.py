import unittest
import logging
from decimal import Decimal
from src_local.utils.compliance_standard import ComplianceStandard

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestComplianceStandard")

class TestComplianceStandard(unittest.TestCase):
    """Garante que o modelo de conformidade está operando conforme o DNA PhD."""

    def test_secure_payload_calculation(self):
        logger.info("⚡ Testando cálculo de payload seguro...")
        result = ComplianceStandard.process_secure_payload("100", db_path=":memory:")
        self.assertEqual(result, Decimal("120.0"))
        logger.info("✅ Cálculo validado.")

    def test_invalid_input_handling(self):
        logger.info("⚡ Testando rejeição de input inválido...")
        with self.assertRaises(ValueError):
            ComplianceStandard.process_secure_payload("invalid_data")
        logger.info("✅ Rejeição validada.")

if __name__ == "__main__":
    unittest.main()
