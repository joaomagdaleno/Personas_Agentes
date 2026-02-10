import unittest
import logging
from unittest.mock import MagicMock, patch
from src_local.agents.Support.call_safety_judge import *


# Configuração de telemetria
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestCall_safety_judge")

class TestCallsafetyjudge(unittest.TestCase):
    def test_is_dangerous_call(self):
        """Valida a detecção de chamadas perigosas (eval, exec, os.system)."""
        logger.info("⚡ Testando detecção de chamadas perigosas...")
        import ast
        judge = CallSafetyJudge(MagicMock())
        
        # Eval
        node_eval = ast.parse("eval('x')").body[0].value
        self.assertTrue(judge._is_dangerous_call(node_eval))
        
        # Exec
        node_exec = ast.parse("exec('y')").body[0].value
        self.assertTrue(judge._is_dangerous_call(node_exec))
        
        # OS System
        node_os = ast.parse("os.system('ls')").body[0].value
        self.assertTrue(judge._is_dangerous_call(node_os))
        
        # Safe call
        node_safe = ast.parse("print('hello')").body[0].value
        self.assertFalse(judge._is_dangerous_call(node_safe))
        logger.info("✅ Detecção de chamadas perigosas validada.")

    def test_validate_safe_context(self):
        """Valida que chamadas em contextos seguros (Test/Log) são permitidas."""
        logger.info("⚡ Testando validação de contexto seguro...")
        import ast
        from unittest.mock import MagicMock
        
        mock_judge = MagicMock()
        mock_judge.is_node_safe.return_value = True
        
        judge = CallSafetyJudge(mock_judge)
        node = ast.parse("eval('x')").body[0].value
        
        valid, msg = judge.validate(node, None, ignore_test_context=False)
        self.assertTrue(valid)
        self.assertIn("contexto seguro", msg)
        logger.info("✅ Validação de contexto seguro concluída.")

if __name__ == "__main__":
    unittest.main()
