import unittest
import logging
from pathlib import Path
from src_local.agents.Python.scale import ScalePersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestScale(unittest.TestCase):
    """
    Testes unitários para o especialista Scale.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade via Pathlib."""
        logger.info("Iniciando validação de identidade do Scale...")
        persona = ScalePersona(Path("."))
        self.assertEqual(persona.name, "Scale")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()
