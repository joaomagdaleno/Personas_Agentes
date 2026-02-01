import unittest
import logging
import sys
from pathlib import Path

# Garante que o src está no path
sys.path.append(str(Path(__file__).parent.parent))

from src.utils.logging_config import configure_logging

class TestLoggingConfig(unittest.TestCase):
    """Garante que o sistema de logs está configurado e funcional."""

    def test_setup_logging(self):
        """Verifica se os handlers foram adicionados corretamente."""
        configure_logging(logging.DEBUG)
        logger = logging.getLogger()
        self.assertTrue(len(logger.handlers) > 0)

if __name__ == "__main__":
    unittest.main()
