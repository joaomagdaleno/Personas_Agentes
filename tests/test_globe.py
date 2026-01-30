import unittest
from src.agents.Python.globe import GlobePersona

class TestGlobe(unittest.TestCase):
    """Testes unitários para o especialista Globe."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = GlobePersona(".")
        self.assertEqual(persona.name, "Globe")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
