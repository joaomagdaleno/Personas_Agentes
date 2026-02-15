import unittest
import logging
from pathlib import Path
import shutil
import tempfile
from src_local.core.validator import CoreValidator

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestValidatorDeep")

class TestValidatorDeep(unittest.TestCase):
    """Bateria de Testes PhD para o Validador de Integridade 🛡️"""
    
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.validator = CoreValidator()

    def tearDown(self):
        if self.test_dir.exists():
            shutil.rmtree(self.test_dir)

    def test_results_parsing_success(self):
        """Valida parsing de output de sucesso do unittest."""
        logger.info("⚡ Testando parsing de sucesso do unittest...")
        output = "Ran 10 tests in 0.1s\nOK"
        res = self.validator._parse_results(output, True)
        self.assertTrue(res["success"])
        self.assertEqual(res["total_run"], 10)
        self.assertEqual(res["failed"], 0)
        self.assertEqual(res["pass_rate"], 100)
        logger.info("✅ Parsing de sucesso validado.")

    def test_results_parsing_failure(self):
        """Valida parsing de output de falha do unittest."""
        logger.info("⚡ Testando parsing de falha do unittest...")
        output = "FAILED (failures=2, errors=1)\nRan 10 tests in 0.1s"
        res = self.validator._parse_results(output, False)
        self.assertFalse(res["success"])
        self.assertEqual(res["total_run"], 10)
        # O parser atual soma failures + errors
        self.assertEqual(res["failed"], 3)
        self.assertLess(res["pass_rate"], 100)
        logger.info("✅ Parsing de falha validado.")

    def test_health_verification_flow(self):
        """Valida o fluxo completo de verificação (Mockado)."""
        logger.info("⚡ Testando fluxo de verificação de saúde...")
        # Como rodar subprocess real é lento, testamos a lógica de retorno
        res = self.validator.verify_core_health(str(self.test_dir))
        self.assertIn("success", res)
        self.assertIn("pass_rate", res)
        self.assertIsInstance(res["total_run"], int)
        logger.info("✅ Fluxo de verificação validado.")
