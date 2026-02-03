import unittest
import logging
from pathlib import Path
from src_local.agents.Python.nexus import NexusPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestNexus(unittest.TestCase):
    """
    Testes unitários para o especialista Nexus.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade via Pathlib."""
        logger.info("Iniciando validação de identidade do Nexus...")
        persona = NexusPersona(Path("."))
        self.assertEqual(persona.name, "Nexus")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()
