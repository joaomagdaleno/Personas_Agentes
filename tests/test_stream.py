import unittest
import logging
from pathlib import Path
from src_local.agents.Python.stream import StreamPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestStream(unittest.TestCase):
    """
    Testes unitários para o especialista Stream.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade via Pathlib."""
        logger.info("Iniciando validação de identidade do Stream...")
        persona = StreamPersona(Path("."))
        self.assertEqual(persona.name, "Stream")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()
