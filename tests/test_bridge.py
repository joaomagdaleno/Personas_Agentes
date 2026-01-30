import unittest
from src.agents.Python.bridge import BridgePersona

class TestBridge(unittest.TestCase):
    """Testes unitários para o especialista Bridge."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = BridgePersona(".")
        self.assertEqual(persona.name, "Bridge")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
