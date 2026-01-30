import unittest
from src.agents.Python.bolt import BoltPersona

class TestBolt(unittest.TestCase):
    """Testes unitários para o especialista Bolt."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = BoltPersona(".")
        self.assertEqual(persona.name, "Bolt")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
