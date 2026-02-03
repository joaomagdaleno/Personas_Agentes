import unittest
import logging
from pathlib import Path
from src_local.agents.Python.forge import ForgePersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestForge(unittest.TestCase):
    """
    Testes unitários para o especialista Forge.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade."""
        logger.info("Iniciando validação de identidade do Forge...")
        persona = ForgePersona(Path("."))
        self.assertEqual(persona.name, "Forge")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()
