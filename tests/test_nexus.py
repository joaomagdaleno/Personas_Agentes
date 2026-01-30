import unittest
from src.agents.Python.nexus import NexusPersona

class TestNexus(unittest.TestCase):
    """Testes unitários para o especialista Nexus."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = NexusPersona(".")
        self.assertEqual(persona.name, "Nexus")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
