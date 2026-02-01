import unittest
from decimal import Decimal
from src.utils.compliance_standard import ComplianceStandard

class TestComplianceStandard(unittest.TestCase):
    """Garante que o modelo de conformidade está operando conforme o DNA PhD."""

    def test_secure_payload_calculation(self):
        result = ComplianceStandard.process_secure_payload("100", db_path=":memory:")
        self.assertEqual(result, Decimal("120.0"))

    def test_invalid_input_handling(self):
        with self.assertRaises(ValueError):
            ComplianceStandard.process_secure_payload("invalid_data")

if __name__ == "__main__":
    unittest.main()
