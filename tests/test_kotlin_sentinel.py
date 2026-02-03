import unittest
from src_local.agents.Kotlin.sentinel import SentinelPersona

class TestKotlinSentinel(unittest.TestCase):
    def setUp(self):
        self.agent = SentinelPersona(project_root=".")

    def test_initialization(self):
        self.assertEqual(self.agent.stack, "Kotlin")
        self.assertEqual(self.agent.name, "Sentinel")

    def test_cyber_security_reasoning(self):
        content = 'val url = "http://unsecure.com"'
        reasoning = self.agent._reason_about_objective("Security", "Network.kt", content)
        self.assertIn("Vulnerabilidade Crítica", reasoning)

if __name__ == "__main__":
    unittest.main()
