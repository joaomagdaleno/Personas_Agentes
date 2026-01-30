import unittest
from src.agents.Python.nebula import NebulaPersona

class TestNebula(unittest.TestCase):
    """Testes unitários para o especialista Nebula."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = NebulaPersona(".")
        self.assertEqual(persona.name, "Nebula")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
