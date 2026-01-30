import unittest
from src.agents.Python.scope import ScopePersona

class TestScope(unittest.TestCase):
    """Testes unitários para o especialista Scope."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = ScopePersona(".")
        self.assertEqual(persona.name, "Scope")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
