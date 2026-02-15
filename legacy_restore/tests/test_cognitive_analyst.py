import unittest
from src_local.utils.markdown_util import MarkdownUtil
from src_local.utils.cognitive_analyst import CognitiveAnalyst

class TestUtilsExtended(unittest.TestCase):
    def test_markdown_util_deduplicate(self):
        seen = {"Header": 1}
        res = MarkdownUtil.deduplicate_header("Header", seen)
        self.assertEqual(res, "Header [v2]")

    def test_markdown_util_padding(self):
        res = ["# Header"]
        raw = ["# Header", "Content"]
        MarkdownUtil.apply_header_padding(res, raw, 0)
        self.assertEqual(len(res), 2)
        self.assertEqual(res[1], "")

    def test_cognitive_analyst_full(self):
        # Teste de Prompt
        res = CognitiveAnalyst._build_prompt("test.py", "doc", "code")
        self.assertIn("test.py", res)
        self.assertIn("doc", res)
        self.assertIn("JSON", res)
        
        # Teste de análise estática sem brain
        mock_brain = MagicMock()
        mock_brain.reason.return_value = '{"consistent": false, "issue": "none", "severity": "LOW"}'
        
        result = CognitiveAnalyst.analyze_intent("file.py", "doc", "code", mock_brain)
        self.assertIsNotNone(result)
        self.assertEqual(result["severity"], "LOW")
        self.assertEqual(result["context"], "CognitiveIntent")
        
        # Teste de falha na IA
        mock_brain.reason.return_value = "invalid response"
        self.assertIsNone(CognitiveAnalyst.analyze_intent("f.py", "d", "c", mock_brain))

if __name__ == '__main__':
    unittest.main()
