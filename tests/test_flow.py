import unittest
import logging
from pathlib import Path
from src.agents.Python.flow import FlowPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestFlow(unittest.TestCase):
    """
    Testes unitários para o especialista Flow.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade."""
        logger.info("Iniciando validação de identidade do Flow...")
        persona = FlowPersona(Path("."))
        self.assertEqual(persona.name, "Flow")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()