import unittest
import logging
from pathlib import Path
from unittest.mock import MagicMock
from src_local.core.validator import CoreValidator

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestCoreValidator")

class TestCoreValidator(unittest.TestCase):
    def setUp(self):
        self.orchestrator = MagicMock()
        self.validator = CoreValidator(self.orchestrator)

    def test_validate_integrity(self):
        logger.info("⚡ Testando validação de integridade do core...")
        # Setup context
        context = {
            "identity": {"stacks": ["Python"]},
            "map": {"src_local/agents/base.py": {"component_type": "CORE", "has_test": True}}
        }
        res = self.validator.validate_system_integrity(context)
        self.assertIsInstance(res, dict)
        self.assertIn("score", res)
        logger.info(f"✅ Integridade validada. Score: {res.get('score')}")

    def test_check_parity(self):
        logger.info("⚡ Testando check de paridade de plataforma...")
        # Empty check
        res = self.validator._check_platform_parity({}, [])
        self.assertEqual(len(res), 0)
        logger.info("✅ Check de paridade validado.")

if __name__ == "__main__":
    unittest.main()
