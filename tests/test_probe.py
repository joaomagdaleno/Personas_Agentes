import unittest
from src.agents.Python.probe import ProbePersona

class TestProbe(unittest.TestCase):
    """Testes unitários para o especialista Probe."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = ProbePersona(".")
        self.assertEqual(persona.name, "Probe")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
