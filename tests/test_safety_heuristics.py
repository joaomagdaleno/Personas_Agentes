import unittest
import logging
from src_local.agents.Support.safety_heuristics import *

# Configuração de telemetria
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestSafety_heuristics")

class TestSafetyheuristics(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for safety_heuristics.py"""
        logger.info("⚡ Iniciando smoke test para safety_heuristics.py...")
        from src_local.agents.Support.safety_heuristics import SafetyHeuristics
        class MockUtils: pass
        sh = SafetyHeuristics(MockUtils())
        self.assertIsNotNone(sh)
        logger.info("✅ Smoke test concluído.")

    def test_heuristics_logic(self):
        """Valida as heurísticas de segurança via análise AST."""
        logger.info("⚡ Testando lógica de heurísticas...")
        import ast
        from src_local.agents.Support.safety_heuristics import SafetyHeuristics
        from src_local.agents.Support.ast_navigator import ASTNavigator
        
        nav = ASTNavigator()
        sh = SafetyHeuristics(nav)

        # 1. Testar is_dangerous_call
        tree = ast.parse("eval('1+1')")
        self.assertTrue(sh.is_dangerous_call(tree.body[0].value))
        
        tree = ast.parse("print('hello')")
        self.assertFalse(sh.is_dangerous_call(tree.body[0].value))

        # 2. Testar is_inside_rule_definition
        tree = ast.parse("rules = [{'regex': 'eval('}]")
        assign_node = tree.body[0]
        # O alvo da regra está dentro da atribuição
        target = assign_node.value.elts[0].values[0] # o 'eval('
        self.assertTrue(sh.is_inside_rule_definition(target, tree))

        # 3. Testar is_inside_log_call
        tree = ast.parse("logger.info(eval('x'))")
        target = tree.body[0].value.args[0]
        self.assertTrue(sh.is_inside_log_call(target, tree))

        logger.info("✅ Heurísticas validadas com 4 asserções.")

if __name__ == "__main__":
    unittest.main()
