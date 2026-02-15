import unittest
from src_local.utils.markdown_util import MarkdownUtil

class TestMarkdownUtil(unittest.TestCase):
    def test_deduplicate_advanced(self):
        seen = {"Header": 1}
        # Caso 1: Header já visto
        res1 = MarkdownUtil.deduplicate_header("Header", seen)
        self.assertEqual(res1, "Header [v2]")
        self.assertEqual(seen["Header"], 2)
        
        # Caso 2: Header novo
        res2 = MarkdownUtil.deduplicate_header("New", seen)
        self.assertEqual(res2, "New")
        self.assertEqual(seen["New"], 1)
        
        # Caso 3: Header com pontuação (deve ser limpo)
        res3 = MarkdownUtil.deduplicate_header("Header!", seen)
        self.assertEqual(res3, "Header [v3]")

    def test_apply_padding_logic(self):
        # Caso 1: Precisa de padding
        res = ["# H1"]
        raw = ["# H1", "Text"]
        MarkdownUtil.apply_header_padding(res, raw, 0)
        self.assertEqual(len(res), 2)
        self.assertEqual(res[1], "")
        
        # Caso 2: Não precisa de padding (já é o fim)
        res2 = ["# H1"]
        raw2 = ["# H1"]
        MarkdownUtil.apply_header_padding(res2, raw2, 0)
        self.assertEqual(len(res2), 1)

if __name__ == '__main__':
    unittest.main()
