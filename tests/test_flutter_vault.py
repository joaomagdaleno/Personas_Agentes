import unittest
from src_local.agents.Flutter.vault import VaultPersona

class TestFlutterVault(unittest.TestCase):
    def setUp(self):
        self.agent = VaultPersona(project_root=".")

    def test_initialization(self):
        self.assertEqual(self.agent.stack, "Flutter")
        self.assertEqual(self.agent.name, "Vault")

    def test_financial_reasoning(self):
        content = "InAppPurchase.instance.buyNonConsumable(...)"
        reasoning = self.agent._reason_about_objective("Economy", "billing.dart", content)
        self.assertIn("Risco de Sustentabilidade", reasoning)

if __name__ == "__main__":
    unittest.main()
