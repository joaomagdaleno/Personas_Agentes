import unittest
from src_local.agents.Support.markdown_structure_agent import MarkdownStructureAgent

class TestMarkdownStructureAgent(unittest.TestCase):
    def test_refinement(self):
        lines = ["# Test", "content"]
        agent = MarkdownStructureAgent(lines)
        res = agent.execute_refinement()
        self.assertEqual(len(res), 2)
        self.assertIn("# Test", res)

if __name__ == '__main__':
    unittest.main()
