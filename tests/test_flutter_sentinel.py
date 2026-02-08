import unittest
import logging
from src_local.agents.Flutter.sentinel import SentinelPersona

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestFlutterSentinel")

class TestFlutterSentinel(unittest.TestCase):
    def setUp(self):
        self.agent = SentinelPersona(project_root=".")

    def test_initialization(self):
        logger.info("⚡ Testando inicialização do Sentinel Flutter...")
        self.assertEqual(self.agent.stack, "Flutter")
        self.assertEqual(self.agent.name, "Sentinel")
        logger.info("✅ Inicialização validada.")

    def test_security_rules(self):
        logger.info("⚡ Testando regras de segurança (HTTP)...")
        # Simula achado de HTTP
        content = "final url = 'http://api.com';"
        reasoning = self.agent._reason_about_objective("Test", "main.dart", content)
        self.assertIn("Vulnerabilidade Crítica", reasoning)
        logger.info("✅ Regras de segurança validadas.")

if __name__ == "__main__":
    unittest.main()
