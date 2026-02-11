import unittest
import logging
from src_local.utils.logging_config import configure_logging

class TestLoggingConfig(unittest.TestCase):
    """🧪 Testes Unitários Soberanos para o LoggingConfig."""

    def test_configuration_resilience(self):
        """Valida se o sistema de logs é configurado sem falhas fatais."""
        configure_logging(level=logging.DEBUG)
        logger = logging.getLogger("Test")
        self.assertIsNotNone(logger)
        self.assertEqual(logger.level, logging.DEBUG)
        
        # Teste de emissão
        logger.info("Teste de Log PhD")
        self.assertTrue(len(logger.handlers) > 0)
        
        # Teste de Performance log
        from src_local.utils.logging_config import log_performance
        log_performance(logger, 0, "Performance Test")
        self.assertTrue(True)
        
        # Teste de setup secundário
        from src_local.utils.logging_config import setup_logging
        setup_logging(level=logging.INFO)
        self.assertEqual(logging.getLogger().level, logging.INFO)

if __name__ == "__main__":
    unittest.main()
