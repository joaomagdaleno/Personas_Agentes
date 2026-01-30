import unittest
from src.agents.Python.voyager import VoyagerPersona

class TestVoyager(unittest.TestCase):
    """Testes unitários para o especialista Voyager."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = VoyagerPersona(".")
        self.assertEqual(persona.name, "Voyager")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
