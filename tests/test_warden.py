import unittest
from src.agents.Python.warden import WardenPersona

class TestWarden(unittest.TestCase):
    """Testes unitários para o especialista Warden."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = WardenPersona(".")
        self.assertEqual(persona.name, "Warden")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
