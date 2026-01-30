import unittest
from src.agents.Python.neural import NeuralPersona

class TestNeural(unittest.TestCase):
    """Testes unitários para o especialista Neural."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = NeuralPersona(".")
        self.assertEqual(persona.name, "Neural")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
