import unittest
from src.agents.Python.cache import CachePersona

class TestCache(unittest.TestCase):
    """Testes unitários para o especialista Cache."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = CachePersona(".")
        self.assertEqual(persona.name, "Cache")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
