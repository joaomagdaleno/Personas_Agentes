import unittest
import os
from index_personas import parse_persona_file

class TestIndexPersonas(unittest.TestCase):
    """Testa o motor de indexação de agentes."""

    def test_parse_valid_content(self):
        """Valida se o parser consegue extrair metadados de uma string de persona."""
        # Cria um arquivo temporário de teste
        test_file = "test_persona.txt"
        with open(test_file, "w", encoding="utf-8") as f:
            f.write('You are "TestAgent" 🤖 - Testing Specialist\nYour mission is to test systems.')
        
        try:
            data = parse_persona_file(test_file)
            self.assertEqual(data["name"], "TestAgent")
            self.assertEqual(data["emoji"], "🤖")
            self.assertIn("Testing Specialist", data["role"])
        finally:
            if os.path.exists(test_file):
                os.remove(test_file)

if __name__ == "__main__":
    unittest.main()

