import unittest
from src.agents.Python.metric import MetricPersona

class TestMetric(unittest.TestCase):
    """Testes unitários para o especialista Metric."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = MetricPersona(".")
        self.assertEqual(persona.name, "Metric")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
