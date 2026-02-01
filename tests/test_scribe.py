import unittest
import logging
from pathlib import Path
from src.agents.Python.scribe import ScribePersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestScribe(unittest.TestCase):
    """
    Testes unitários para o especialista Scribe.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade via Pathlib."""
        logger.info("Iniciando validação de identidade do Scribe...")
        persona = ScribePersona(Path("."))
        self.assertEqual(persona.name, "Scribe")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()