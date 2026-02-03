import unittest
import logging
from src_local.utils.logging_config import configure_logging

class TestLoggingConfig(unittest.TestCase):
    """🧪 Testes Unitários Soberanos para o LoggingConfig."""

    def test_configuration_resilience(self):
        """Valida se o sistema de logs é configurado sem falhas fatais."""
        try:
            configure_logging(level=logging.DEBUG)
            logger = logging.getLogger("Test")
            logger.info("Teste de Log PhD")
            self.assertTrue(True)
        except Exception as e:
            self.fail(f"Configuração de log falhou: {e}")

if __name__ == "__main__":
    unittest.main()
