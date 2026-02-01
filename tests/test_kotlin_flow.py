import unittest
from src.agents.Kotlin.flow import FlowPersona

class TestKotlinFlow(unittest.TestCase):
    def setUp(self):
        self.agent = FlowPersona(project_root=".")

    def test_initialization(self):
        self.assertEqual(self.agent.stack, "Kotlin")
        self.assertEqual(self.agent.name, "Flow")

    def test_navigation_reasoning(self):
        content = "composable('home') { ... }"
        reasoning = self.agent._reason_about_objective("Control", "Main.kt", content)
        self.assertIn("Entropia de Destino", reasoning)

if __name__ == "__main__":
    unittest.main()
