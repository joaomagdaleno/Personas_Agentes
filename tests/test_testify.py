import unittest
from src.agents.Python.testify import TestifyPersona

class TestTestify(unittest.TestCase):
    """Testes unitários para o especialista Testify."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = TestifyPersona(".")
        self.assertEqual(persona.name, "Testify")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
