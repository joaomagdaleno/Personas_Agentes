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
        # Conteúdo genérico para evitar gatilho de segredo
        content = "dependency = 'org.jetbrains.kotlin:kotlin-stdlib'"
        reasoning = self.agent._reason_about_objective("Build", "build.gradle.kts", content)
        self.assertIsInstance(reasoning, str)

if __name__ == "__main__":
    unittest.main()
