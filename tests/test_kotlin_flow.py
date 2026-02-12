import unittest
import logging
from src_local.agents.Kotlin.System.flow import FlowPersona

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestKotlinFlow")

class TestKotlinFlow(unittest.TestCase):
    def setUp(self):
        self.agent = FlowPersona(project_root=".")

    def test_initialization(self):
        logger.info("⚡ Testando inicialização do Flow Kotlin...")
        self.assertEqual(self.agent.stack, "Kotlin")
        self.assertEqual(self.agent.name, "Flow")
        logger.info("✅ Inicialização validada.")

    def test_navigation_reasoning(self):
        logger.info("⚡ Testando raciocínio de navegação...")
        content = "composable('home') { ... }"
        reasoning = self.agent._reason_about_objective("Control", "Main.kt", content)
        self.assertIn("Entropia de Destino", reasoning)
        logger.info("✅ Raciocínio de navegação validado.")

if __name__ == "__main__":
    unittest.main()
