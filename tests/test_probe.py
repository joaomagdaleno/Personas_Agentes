import unittest
import logging
from pathlib import Path
from src_local.agents.Python.Audit.probe import ProbePersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestProbe(unittest.TestCase):
    """
    Testes unitários para o especialista Probe.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade via Pathlib."""
        logger.info("Iniciando validação de identidade do Probe...")
        persona = ProbePersona(Path("."))
        self.assertEqual(persona.name, "Probe")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()
