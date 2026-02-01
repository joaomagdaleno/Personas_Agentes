import unittest
import logging
from pathlib import Path
from src.agents.Python.echo import EchoPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestEcho(unittest.TestCase):
    """
    Testes unitários para o especialista Echo.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade."""
        logger.info("Iniciando validação de identidade do Echo...")
        persona = EchoPersona(Path("."))
        self.assertEqual(persona.name, "Echo")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()