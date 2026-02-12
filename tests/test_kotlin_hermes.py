import unittest
import logging
from src_local.agents.Kotlin.System.hermes import HermesPersona

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestKotlinHermes")

class TestKotlinHermes(unittest.TestCase):
    def setUp(self):
        self.agent = HermesPersona(project_root=".")

    def test_initialization(self):
        logger.info("⚡ Testando inicialização do Hermes Kotlin...")
        self.assertEqual(self.agent.stack, "Kotlin")
        self.assertEqual(self.agent.name, "Hermes")
        logger.info("✅ Inicialização validada.")

    def test_supply_chain_reasoning(self):
        logger.info("⚡ Testando raciocínio de supply chain...")
        content = "storePassword = '123456'"
        reasoning = self.agent._reason_about_objective("Build", "build.gradle.kts", content)
        self.assertIn("Risco de Integridade", reasoning)
        logger.info("✅ Raciocínio de supply chain validado.")

if __name__ == "__main__":
    unittest.main()
