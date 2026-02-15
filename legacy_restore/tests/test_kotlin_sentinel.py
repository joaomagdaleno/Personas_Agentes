import unittest
import logging
from src_local.agents.Kotlin.Strategic.sentinel import SentinelPersona

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestKotlinSentinel")

class TestKotlinSentinel(unittest.TestCase):
    def setUp(self):
        self.agent = SentinelPersona(project_root=".")

    def test_initialization(self):
        logger.info("⚡ Testando inicialização do Sentinel Kotlin...")
        self.assertEqual(self.agent.stack, "Kotlin")
        self.assertEqual(self.agent.name, "Sentinel")
        logger.info("✅ Inicialização validada.")

    def test_cyber_security_reasoning(self):
        logger.info("⚡ Testando raciocínio de segurança cibernética...")
        content = 'val url = "http://unsecure.com"'
        reasoning = self.agent._reason_about_objective("Security", "Network.kt", content)
        self.assertIn("Vulnerabilidade Crítica", reasoning)
        logger.info("✅ Raciocínio de segurança validado.")

if __name__ == "__main__":
    unittest.main()
