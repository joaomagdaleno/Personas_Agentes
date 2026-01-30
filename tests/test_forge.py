import unittest
from src.agents.Python.forge import ForgePersona

class TestForge(unittest.TestCase):
    """Testes unitários para o especialista Forge."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = ForgePersona(".")
        self.assertEqual(persona.name, "Forge")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
