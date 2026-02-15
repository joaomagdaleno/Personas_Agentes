import unittest
import logging
from pathlib import Path
from src_local.agents.Python.System.hermes import HermesPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestHermes(unittest.TestCase):
    """
    Testes unitários para o especialista Hermes.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade."""
        logger.info("Iniciando validação de identidade do Hermes...")
        persona = HermesPersona(Path("."))
        self.assertEqual(persona.name, "Hermes")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()
