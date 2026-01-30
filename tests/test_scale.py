import unittest
from src.agents.Python.scale import ScalePersona

class TestScale(unittest.TestCase):
    """Testes unitários para o especialista Scale."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = ScalePersona(".")
        self.assertEqual(persona.name, "Scale")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
