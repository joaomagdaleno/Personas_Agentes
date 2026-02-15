import unittest
import logging
from pathlib import Path
from src_local.agents.Python.Content.palette import PalettePersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestPalette(unittest.TestCase):
    """
    Testes unitários para o especialista Palette.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade via Pathlib."""
        logger.info("Iniciando validação de identidade do Palette...")
        persona = PalettePersona(Path("."))
        self.assertEqual(persona.name, "Palette")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()
