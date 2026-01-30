import unittest
from src.agents.Python.echo import EchoPersona

class TestEcho(unittest.TestCase):
    """Testes unitários para o especialista Echo."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = EchoPersona(".")
        self.assertEqual(persona.name, "Echo")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
