import unittest
import logging
from logging_config import setup_logging

class TestLoggingConfig(unittest.TestCase):
    """Garante que o sistema de logs está configurado e funcional."""

    def test_setup_logging(self):
        """Verifica se os handlers foram adicionados corretamente."""
        setup_logging(logging.DEBUG)
        logger = logging.getLogger()
        self.assertTrue(len(logger.handlers) > 0)
        self.assertEqual(logger.level, logging.DEBUG)

if __name__ == "__main__":
    unittest.main()
