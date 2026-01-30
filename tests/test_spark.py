import unittest
from src.agents.Python.spark import SparkPersona

class TestSpark(unittest.TestCase):
    """Testes unitários para o especialista Spark."""
    
    def test_init(self):
        """Valida inicialização e identidade."""
        persona = SparkPersona(".")
        self.assertEqual(persona.name, "Spark")
        self.assertEqual(persona.stack, "Python")

if __name__ == "__main__":
    unittest.main()
