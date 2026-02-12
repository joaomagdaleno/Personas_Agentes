import unittest
import logging
from src_local.agents.Flutter.Strategic.vault import VaultPersona

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestFlutterVault")

class TestFlutterVault(unittest.TestCase):
    def setUp(self):
        self.agent = VaultPersona(project_root=".")

    def test_initialization(self):
        logger.info("⚡ Testando inicialização do Vault Flutter...")
        self.assertEqual(self.agent.stack, "Flutter")
        self.assertEqual(self.agent.name, "Vault")
        logger.info("✅ Inicialização validada.")

    def test_financial_reasoning(self):
        logger.info("⚡ Testando raciocínio financeiro...")
        content = "InAppPurchase.instance.buyNonConsumable(...)"
        reasoning = self.agent._reason_about_objective("Economy", "billing.dart", content)
        self.assertIn("Risco de Sustentabilidade", reasoning)
        logger.info("✅ Raciocínio financeiro validado.")

if __name__ == "__main__":
    unittest.main()
