import unittest
from src_local.agents.Support.security_sentinel_agent import SecuritySentinelAgent

class TestSecuritySentinel(unittest.TestCase):
    def setUp(self):
        self.agent = SecuritySentinelAgent()

    def test_secret_detection(self):
        content = "api_key = 'sk-123456789012345678901234567890123456789012345678'"
        hits = self.agent._scan_content("test.py", content)
        self.assertTrue(len(hits) > 0)
        self.assertEqual(hits[0]["issue"], "Segredo Exposto: OpenAI API Key")

    def test_no_secrets(self):
        content = "print('hello world')"
        hits = self.agent._scan_content("test.py", content)
        self.assertEqual(len(hits), 0)

if __name__ == '__main__':
    unittest.main()
