import unittest
import logging
from pathlib import Path
from src.agents.Python.neural import NeuralPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestNeural(unittest.TestCase):
    """
    Testes unitários para o especialista Neural.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade via Pathlib."""
        logger.info("Iniciando validação de identidade do Neural...")
        persona = NeuralPersona(Path("."))
        self.assertEqual(persona.name, "Neural")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()