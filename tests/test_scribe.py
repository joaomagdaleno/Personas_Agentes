import unittest
from src.agents.Python.scribe import ScribePersona

class TestScribe(unittest.TestCase):
    """Testes unitários para o especialista Scribe."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = ScribePersona(".")
        self.assertEqual(persona.name, "Scribe")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
