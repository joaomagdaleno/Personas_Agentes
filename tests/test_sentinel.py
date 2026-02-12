import unittest
import logging
from pathlib import Path
from src_local.agents.Python.Strategic.sentinel import SentinelPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestSentinel(unittest.TestCase):
    """
    Testes unitários para o especialista Sentinel.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade via Pathlib."""
        logger.info("Iniciando validação de identidade do Sentinel...")
        persona = SentinelPersona(Path("."))
        self.assertEqual(persona.name, "Sentinel")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()
