import unittest
import logging
from pathlib import Path
from src_local.agents.Python.Content.mantra import MantraPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestMantra(unittest.TestCase):
    """
    Testes unitários para o especialista Mantra.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade."""
        logger.info("Iniciando validação de identidade do Mantra...")
        persona = MantraPersona(Path("."))
        self.assertEqual(persona.name, "Mantra")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()
