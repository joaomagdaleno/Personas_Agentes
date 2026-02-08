import unittest
import logging
from scripts.verify_report_lint import main

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestVerifyReportLint")

class TestVerifyReportLint(unittest.TestCase):
    def test_main_exists(self):
        logger.info("⚡ Verificando existência de main em verify_report_lint...")
        self.assertTrue(callable(main))
        logger.info("✅ Main validada.")

if __name__ == '__main__':
    unittest.main()
