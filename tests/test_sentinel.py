import unittest
from src.agents.Python.sentinel import SentinelPersona

class TestSentinel(unittest.TestCase):
    """Testes unitários para o especialista Sentinel."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = SentinelPersona(".")
        self.assertEqual(persona.name, "Sentinel")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
