import unittest
from src.agents.Python.hype import HypePersona

class TestHype(unittest.TestCase):
    """Testes unitários para o especialista Hype."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = HypePersona(".")
        self.assertEqual(persona.name, "Hype")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
