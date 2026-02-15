import unittest
import logging
from src_local.agents.Support.markdown_sanitizer import MarkdownSanitizer

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestMarkdownSanitizer")

class TestMarkdownSanitizer(unittest.TestCase):
    def setUp(self):
        self.sanitizer = MarkdownSanitizer()

    def test_md012_collapse_lines(self):
        logger.info("⚡ Testando colapso de linhas MD012...")
        content = "Line 1\n\n\nLine 2"
        expected = "Line 1\n\nLine 2\n"
        self.assertEqual(self.sanitizer.sanitize(content), expected)
        logger.info("✅ Colapso de linhas validado.")

    def test_md012_ignore_code_blocks(self):
        logger.info("⚡ Testando preservação de blocos de código...")
        content = "Line 1\n\n```python\n\n\ndef foo(): pass\n\n\n```\n\nLine 2"
        result = self.sanitizer.sanitize(content)
        self.assertIn("```python\n\n\ndef foo(): pass\n\n\n```", result)
        logger.info("✅ Preservação validada.")

    def test_md026_remove_heading_punctuation(self):
        logger.info("⚡ Testando remoção de pontuação em cabeçalhos MD026...")
        content = "# Heading 1!\n## Heading 2??\n### Heading 3:"
        result = self.sanitizer.sanitize(content)
        self.assertIn("# Heading 1\n", result)
        self.assertIn("## Heading 2\n", result)
        self.assertIn("### Heading 3\n", result)
        logger.info("✅ Remoção de pontuação validada.")

    def test_md024_unique_headings(self):
        logger.info("⚡ Testando unicidade de cabeçalhos MD024...")
        content = "# Heading\n# Heading"
        result = self.sanitizer.sanitize(content)
        self.assertIn("# Heading [v2]", result)
        logger.info("✅ Unicidade validada.")

    def test_md022_heading_padding(self):
        logger.info("⚡ Testando padding de cabeçalhos MD022...")
        content = "Text\n# Heading\nMore Text"
        expected = "Text\n\n# Heading\n\nMore Text\n"
        self.assertEqual(self.sanitizer.sanitize(content), expected)
        logger.info("✅ Padding validado.")

if __name__ == "__main__":
    unittest.main()
