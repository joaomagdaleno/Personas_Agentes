
import unittest
from pathlib import Path
from unittest.mock import MagicMock
from src_local.core.validator import CoreValidator

class TestCoreValidator(unittest.TestCase):
    def setUp(self):
        self.orchestrator = MagicMock()
        self.validator = CoreValidator(self.orchestrator)

    def test_validate_integrity(self):
        # Setup context
        context = {
            "identity": {"stacks": ["Python"]},
            "map": {"src_local/agents/base.py": {"component_type": "CORE", "has_test": True}}
        }
        res = self.validator.validate_system_integrity(context)
        self.assertIsInstance(res, dict)
        self.assertIn("score", res)

    def test_check_parity(self):
        # Empty check
        res = self.validator._check_platform_parity({}, [])
        self.assertEqual(len(res), 0)

if __name__ == "__main__":
    unittest.main()
