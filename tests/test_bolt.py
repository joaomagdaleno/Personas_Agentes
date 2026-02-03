import unittest
import logging
from pathlib import Path
from src_local.agents.Python.bolt import BoltPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestBolt(unittest.TestCase):
    """
    Testes unitários para o especialista Bolt.
    Monitorado por Dr. Metric e Dr. Voyager.
    """
    
    def test_init(self):
        """Valida inicialização e identidade via Pathlib."""
        logger.info("Iniciando validação de identidade do Bolt...")
        persona = BoltPersona(Path("."))
        self.assertEqual(persona.name, "Bolt")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()
