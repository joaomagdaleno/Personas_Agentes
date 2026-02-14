import unittest
from src_local.agents.Support.security_sentinel_agent import SecuritySentinelAgent

class TestSecuritySentinel(unittest.TestCase):
    def setUp(self):
        self.agent = SecuritySentinelAgent()

    def test_secret_detection(self):
        content = "api_key = os.getenv('OPENAI_API_KEY', 'default_value')"
        hits = self.agent._scan_content("test.py", content)
        self.assertTrue(len(hits) > 0)
        self.assertEqual(hits[0]["issue"], "Segredo Exposto: OpenAI API Key")

if __name__ == '__main__':
    unittest.main()