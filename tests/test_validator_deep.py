import unittest
from pathlib import Path
import shutil
import tempfile
from src_local.core.validator import SystemValidator

class TestValidatorDeep(unittest.TestCase):
    """Bateria de Testes PhD para o Validador de Integridade 🛡️"""
    
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.validator = SystemValidator()

    def tearDown(self):
        if self.test_dir.exists():
            shutil.rmtree(self.test_dir)

    def test_results_parsing_success(self):
        """Valida parsing de output de sucesso do unittest."""
        output = "Ran 10 tests in 0.1s\nOK"
        res = self.validator._parse_results(output, True)
        self.assertTrue(res["success"])
        self.assertEqual(res["total_run"], 10)
        self.assertEqual(res["failed"], 0)
        self.assertEqual(res["pass_rate"], 100)

    def test_results_parsing_failure(self):
        """Valida parsing de output de falha do unittest."""
        output = "FAILED (failures=2, errors=1)\nRan 10 tests in 0.1s"
        res = self.validator._parse_results(output, False)
        self.assertFalse(res["success"])
        self.assertEqual(res["total_run"], 10)
        # O parser atual soma failures + errors
        self.assertEqual(res["failed"], 3)
        self.assertLess(res["pass_rate"], 100)

    def test_health_verification_flow(self):
        """Valida o fluxo completo de verificação (Mockado)."""
        # Como rodar subprocess real é lento, testamos a lógica de retorno
        res = self.validator.verify_core_health(str(self.test_dir))
        self.assertIn("success", res)
        self.assertIn("pass_rate", res)
        self.assertIsInstance(res["total_run"], int)
