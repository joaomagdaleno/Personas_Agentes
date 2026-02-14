import unittest
from src_local.utils.markdown_processor import MarkdownStructureProcessor

class TestMarkdownProcessorDetailed(unittest.TestCase):
    def test_process_with_code_blocks(self):
        lines = ["# Title", "```python", "print(1)", "```"]
        proc = MarkdownStructureProcessor(lines)
        res = proc.process()
        # O processador adiciona padding após o header
        self.assertTrue(len(res) >= 4)
        self.assertIn("```python", res)

    def test_header_padding_application(self):
        lines = ["# Title", "Content"]
        proc = MarkdownStructureProcessor(lines)
        res = proc.process()
        # O processador deve adicionar uma linha vazia entre header e content
        self.assertIn("", res)

if __name__ == '__main__':
    unittest.main()
