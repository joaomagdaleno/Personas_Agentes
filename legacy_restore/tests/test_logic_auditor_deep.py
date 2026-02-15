import unittest
import ast
from src_local.agents.Support.logic_auditor import LogicAuditor

class TestLogicAuditorDeep(unittest.TestCase):
    """Bateria de Testes PhD para a Integridade Lógica 🧠"""
    
    def setUp(self):
        self.auditor = LogicAuditor()

    def test_silent_error_detection(self):
        """Valida detecção de try-except-pass."""
        code = """try:
    do()
except:
    pass"""
        tree = ast.parse(code)
        # Forçamos o ignore_test_context=True para que o auditor detecte o erro mesmo rodando em ambiente de teste
        issues = self.auditor.scan_flaws(tree, "test.py", code.splitlines(), "TestAgent", ignore_test_context=True)
        
        self.assertEqual(len(issues), 1)
        self.assertEqual(issues[0]["issue"], "Captura de erro silenciosa detectada.")
        self.assertEqual(issues[0]["severity"], "high")

    def test_safe_except_ignored(self):
        """Garante que exceções tratadas não gerem alertas."""
        code = """try:
    do()
except Exception as e:
    logger.error(e)"""
        tree = ast.parse(code)
        issues = self.auditor.scan_flaws(tree, "test.py", code.splitlines(), "TestAgent")
        self.assertEqual(len(issues), 0)
