import unittest
import logging
from pathlib import Path
from src.agents.Python.cache import CachePersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestCache(unittest.TestCase):
    """
    Testes unitários para o especialista Cache.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização e identidade."""
        logger.info("Iniciando validação de identidade do Cache...")
        persona = CachePersona(Path("."))
        self.assertEqual(persona.name, "Cache")
        self.assertEqual(persona.stack, "Python")
        logger.info("✅ Identidade validada.")

if __name__ == "__main__":
    unittest.main()