import unittest
import logging
from pathlib import Path
from src.agents.Python.spark import SparkPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestSpark(unittest.TestCase):
    """
    Testes unitários para o especialista Spark.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade via Pathlib."""
        logger.info("Iniciando validação de identidade do Spark...")
        persona = SparkPersona(Path("."))
        self.assertEqual(persona.name, "Spark")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()