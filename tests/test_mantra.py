import unittest
from src.agents.Python.mantra import MantraPersona

class TestMantra(unittest.TestCase):
    """Testes unitários para o especialista Mantra."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = MantraPersona(".")
        self.assertEqual(persona.name, "Mantra")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
