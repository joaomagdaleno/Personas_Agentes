import unittest
from src.agents.Python.stream import StreamPersona

class TestStream(unittest.TestCase):
    """Testes unitários para o especialista Stream."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = StreamPersona(".")
        self.assertEqual(persona.name, "Stream")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
