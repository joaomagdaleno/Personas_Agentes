import unittest
import logging
from pathlib import Path
from src_local.agents.Python.Strategic.warden import WardenPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestWarden(unittest.TestCase):
    """
    Testes unitários para o especialista Warden.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade via Pathlib."""
        logger.info("Iniciando validação de identidade do Warden...")
        persona = WardenPersona(Path("."))
        self.assertEqual(persona.name, "Warden")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()
