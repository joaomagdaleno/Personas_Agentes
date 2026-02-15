import unittest
import logging
from pathlib import Path
from src_local.agents.Python.Audit.nebula import NebulaPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestNebula(unittest.TestCase):
    """
    Testes unitários para o especialista Nebula.
    Monitorado por Dr. Metric e Dr. Voyager.
    """
    
    def test_init(self):
        """Valida inicialização e identidade via Pathlib."""
        logger.info("Iniciando validação de identidade do Nebula...")
        persona = NebulaPersona(Path("."))
        self.assertEqual(persona.name, "Nebula")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()
