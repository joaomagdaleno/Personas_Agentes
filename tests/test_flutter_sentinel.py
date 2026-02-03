import unittest
from src_local.agents.Flutter.sentinel import SentinelPersona

class TestFlutterSentinel(unittest.TestCase):
    def setUp(self):
        self.agent = SentinelPersona(project_root=".")

    def test_initialization(self):
        self.assertEqual(self.agent.stack, "Flutter")
        self.assertEqual(self.agent.name, "Sentinel")

    def test_security_rules(self):
        # Simula achado de HTTP
        content = "final url = 'http://api.com';"
        reasoning = self.agent._reason_about_objective("Test", "main.dart", content)
        self.assertIn("Vulnerabilidade Crítica", reasoning)

if __name__ == "__main__":
    unittest.main()
