import unittest
import logging
from pathlib import Path
from src_local.agents.Python.System.bridge import BridgePersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestBridge(unittest.TestCase):
    """
    Testes unitários para o especialista Bridge.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade."""
        logger.info("Iniciando validação de identidade do Bridge...")
        persona = BridgePersona(Path("."))
        self.assertEqual(persona.name, "Bridge")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()
