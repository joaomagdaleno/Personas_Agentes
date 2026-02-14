import unittest
from unittest.mock import MagicMock
from src_local.agents.Support.code_inspector_agent import CodeInspectorAgent

class TestCodeInspectorAgent(unittest.TestCase):
    def test_init(self):
        agent = CodeInspectorAgent()
        self.assertIsNone(agent.brain)
        self.assertIsInstance(agent, CodeInspectorAgent)

    def test_inspect_intent_no_brain(self):
        agent = CodeInspectorAgent(None)
        res = agent.inspect_intent("code", "file.py")
        self.assertIsNone(res)

    def test_scan_file_logic_empty(self):
        agent = CodeInspectorAgent()
        res = agent.scan_file_logic("non_existent.py", "./", [], MagicMock())
        self.assertEqual(res, [])

if __name__ == '__main__':
    unittest.main()
