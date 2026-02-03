import unittest
import logging
from pathlib import Path
from src_local.agents.Python.hype import HypePersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestHype(unittest.TestCase):
    """
    Testes unitários para o especialista Hype.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade."""
        logger.info("Iniciando validação de identidade do Hype...")
        persona = HypePersona(Path("."))
        self.assertEqual(persona.name, "Hype")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()
