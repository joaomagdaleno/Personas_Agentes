import unittest
from src.agents.Python.flow import FlowPersona

class TestFlow(unittest.TestCase):
    """Testes unitários para o especialista Flow."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = FlowPersona(".")
        self.assertEqual(persona.name, "Flow")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
