import unittest
import logging
from pathlib import Path
from src.agents.Python.voyager import VoyagerPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestVoyager(unittest.TestCase):
    """
    Testes unitários para o especialista Voyager.
    Monitorado por Dr. Metric e Dr. Voyager.
    """
    
    def test_init(self):
        """Valida inicialização e identidade via Pathlib."""
        logger.info("Iniciando validação de identidade do Voyager...")
        persona = VoyagerPersona(Path("."))
        self.assertEqual(persona.name, "Voyager")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()