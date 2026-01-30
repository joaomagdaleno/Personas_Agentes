import unittest
from src.agents.Python.hermes import HermesPersona

class TestHermes(unittest.TestCase):
    """Testes unitários para o especialista Hermes."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = HermesPersona(".")
        self.assertEqual(persona.name, "Hermes")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
