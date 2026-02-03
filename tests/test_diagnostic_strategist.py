import unittest
from src_local.agents.Support.diagnostic_strategist import DiagnosticStrategist

class TestDiagnosticStrategist(unittest.TestCase):
    """🧪 Testes Unitários Soberanos para o DiagnosticStrategist."""

    def setUp(self):
        self.strategist = DiagnosticStrategist()

    def test_plan_targeted_verification(self):
        """Valida a geração do plano de batalha alvo."""
        initial_findings = [
            {"file": "app.py", "context": "Sentinel"},
            {"file": "app.py", "context": "Vault"},
            {"file": "db.py", "context": "Cache"}
        ]
        
        audit_map = self.strategist.plan_targeted_verification(initial_findings)
        self.assertIn("app.py", audit_map)
        self.assertEqual(len(audit_map["app.py"]), 2)
        self.assertIn("Sentinel", audit_map["app.py"])

    def test_efficiency_calculation(self):
        """Valida o cálculo do ganho de economia de I/O."""
        res = self.strategist.calculate_efficiency(100, 2)
        self.assertEqual(res["saved_io"], 98.0)
        self.assertEqual(res["efficiency_label"], "ALTA")

if __name__ == "__main__":
    unittest.main()
