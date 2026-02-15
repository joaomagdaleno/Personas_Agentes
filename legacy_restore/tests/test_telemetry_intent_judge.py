import unittest
import logging
from src_local.agents.Support.telemetry_intent_judge import *

# Configuração de telemetria
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestTelemetry_intent_judge")

class TestTelemetryintentjudge(unittest.TestCase):
    def test_judge_intent_logic(self):
        """Valida o julgamento de intencionalidade de telemetria."""
        logger.info("⚡ Testando lógica de julgamento de telemetria...")
        import ast
        from src_local.agents.Support.safety_heuristics import SafetyHeuristics
        from src_local.agents.Support.ast_navigator import ASTNavigator
        
        nav = ASTNavigator()
        heuristics = SafetyHeuristics(nav)
        judge = TelemetryIntentJudge(heuristics, None)
        
        # 1. Caso Seguro: Dentro de definição de regra
        tree = ast.parse("TELEMETRY_KEYWORDS = ['duration']")
        node = tree.body[0].value # Passar o valor da atribuição
        res, sev, reason = judge.judge_intent(node, tree)
        self.assertTrue(res)
        self.assertEqual(sev, "STRATEGIC")
        
        # 2. Caso de Risco: Subtração manual de tempo
        tree = ast.parse("duration = time.time() - start_t")
        node = tree.body[0].value
        res, sev, reason = judge.judge_intent(node, tree)
        self.assertFalse(res)
        self.assertEqual(sev, "STRATEGIC")
        self.assertIn("Cálculo de duração manual", reason)
        
        # 3. Caso Crítico: Dentro de logger.error
        tree = ast.parse("logger.error(f'Took {time.time() - start_t}')")
        # Vamos caminhar na árvore para achar a subtração de forma segura
        sub_node = None
        for n in ast.walk(tree):
            if isinstance(n, ast.BinOp) and isinstance(n.op, ast.Sub):
                sub_node = n
                break
        
        self.assertIsNotNone(sub_node)
        res, sev, reason = judge.judge_intent(sub_node, tree)
        self.assertFalse(res)
        self.assertEqual(sev, "HIGH")
        self.assertIn("fluxo de erro crítico", reason)
        
        logger.info("✅ Julgamento de intenção validado.")

if __name__ == "__main__":
    unittest.main()
