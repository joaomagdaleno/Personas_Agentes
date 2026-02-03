import unittest
from src_local.agents.Kotlin.hermes import HermesPersona

class TestKotlinHermes(unittest.TestCase):
    def setUp(self):
        self.agent = HermesPersona(project_root=".")

    def test_initialization(self):
        self.assertEqual(self.agent.stack, "Kotlin")
        self.assertEqual(self.agent.name, "Hermes")

    def test_supply_chain_reasoning(self):
        content = "storePassword = '123456'"
        reasoning = self.agent._reason_about_objective("Build", "build.gradle.kts", content)
        self.assertIn("Risco de Integridade", reasoning)

if __name__ == "__main__":
    unittest.main()
