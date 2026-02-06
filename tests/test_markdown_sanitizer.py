import unittest
from src_local.agents.Support.markdown_sanitizer import MarkdownSanitizer

class TestMarkdownSanitizer(unittest.TestCase):
    def setUp(self):
        self.sanitizer = MarkdownSanitizer()

    def test_md012_collapse_lines(self):
        content = "Line 1\n\n\nLine 2"
        expected = "Line 1\n\nLine 2\n"
        self.assertEqual(self.sanitizer.sanitize(content), expected)

    def test_md012_ignore_code_blocks(self):
        content = "Line 1\n\n```python\n\n\ndef foo(): pass\n\n\n```\n\nLine 2"
        # The logic collapses lines OUTSIDE code blocks.
        # Inside code blocks, it preserves them.
        # Passagem 1: raw_lines collapses consecutive empty lines outside.
        # Let's trace: 
        # Line 1, '', '', ```python (pushed)
        # Inside: '', '', def foo... '', '', ``` (pushed)
        # Outside: '', Line 2
        # Result: Line 1, '', ```python, '', '', def foo..., '', '', ```, '', Line 2
        result = self.sanitizer.sanitize(content)
        self.assertIn("```python\n\n\ndef foo(): pass\n\n\n```", result)

    def test_md026_remove_heading_punctuation(self):
        content = "# Heading 1!\n## Heading 2??\n### Heading 3:"
        result = self.sanitizer.sanitize(content)
        self.assertIn("# Heading 1\n", result)
        self.assertIn("## Heading 2\n", result)
        self.assertIn("### Heading 3\n", result)

    def test_md024_unique_headings(self):
        content = "# Heading\n# Heading"
        result = self.sanitizer.sanitize(content)
        self.assertIn("# Heading [v2]", result)

    def test_md022_heading_padding(self):
        content = "Text\n# Heading\nMore Text"
        expected = "Text\n\n# Heading\n\nMore Text\n"
        self.assertEqual(self.sanitizer.sanitize(content), expected)

if __name__ == "__main__":
    unittest.main()
