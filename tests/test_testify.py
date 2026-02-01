import unittest
import logging
from pathlib import Path
from src.agents.Python.testify import TestifyPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestTestify(unittest.TestCase):
    """
    Testes unitários para o especialista Testify.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade via Pathlib."""
        logger.info("Iniciando validação de identidade do Testify...")
        persona = TestifyPersona(Path("."))
        self.assertEqual(persona.name, "Testify")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()