import unittest
import logging
from pathlib import Path
from src_local.agents.Python.Content.globe import GlobePersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestGlobe(unittest.TestCase):
    """
    Testes unitários para o especialista Globe.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade."""
        logger.info("Iniciando validação de identidade do Globe...")
        persona = GlobePersona(Path("."))
        self.assertEqual(persona.name, "Globe")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()
