import unittest
import logging
from src_local.agents.Support.silent_error_detector import *

# Configuração de telemetria
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestSilent_error_detector")

class TestSilenterrordetector(unittest.TestCase):
    def test_detect_silent_pass(self):
        """Valida a detecção de try-except-pass."""
        logger.info("⚡ Testando detecção de erro silencioso (pass)...")
        import ast
        from unittest.mock import MagicMock
        
        mock_judge = MagicMock()
        mock_judge.is_node_safe.return_value = False
        
        detector = SilentErrorDetector(mock_judge)
        code = "try:\n    do_something()\nexcept:\n    pass"
        tree = ast.parse(code)
        
        issues = detector.detect(tree, "test.py", code.splitlines(), "Analyst")
        self.assertEqual(len(issues), 1)
        self.assertEqual(issues[0]['issue'], 'Captura de erro silenciosa detectada.')
        self.assertIn("pass", issues[0]['snippet'])
        logger.info("✅ Erro silencioso (pass) validado.")

    def test_detect_silent_continue(self):
        """Valida a detecção de try-except-continue."""
        logger.info("⚡ Testando detecção de erro silencioso (continue)...")
        import ast
        from unittest.mock import MagicMock
        
        mock_judge = MagicMock()
        mock_judge.is_node_safe.return_value = False
        
        detector = SilentErrorDetector(mock_judge)
        code = "for i in range(10):\n    try:\n        do_something()\n    except:\n        continue"
        tree = ast.parse(code)
        
        issues = detector.detect(tree, "test.py", code.splitlines(), "Analyst")
        self.assertEqual(len(issues), 1)
        self.assertIn("continue", issues[0]['snippet'])
        logger.info("✅ Erro silencioso (continue) validado.")

if __name__ == "__main__":
    unittest.main()
