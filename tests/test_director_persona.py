import unittest
import logging
from pathlib import Path
from src_local.agents.director import DirectorPersona

# Telemetria PhD para Testes
logger = logging.getLogger(__name__)

class TestDirectorPersona(unittest.TestCase):
    """
    Testes para o Diretor Estratégico.
    Monitorado por Dr. Metric.
    """
    
    def test_init(self):
        """Valida inicialização do diretor."""
        logger.info("Auditando inicialização do Diretor...")
        director = DirectorPersona(Path("."))
        self.assertEqual(director.name, "Director")
        logger.info("✅ Diretor operacional.")

if __name__ == "__main__":
    unittest.main()
