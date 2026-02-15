import unittest
import logging
from src_local.agents.Support.semantic_context_analyst import *

# Configuração de telemetria
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestSemantic_context_analyst")

class TestSemanticcontextanalyst(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for semantic_context_analyst.py"""
        logger.info("⚡ Iniciando smoke test para semantic_context_analyst.py...")
        from src_local.agents.Support.semantic_context_analyst import SemanticContextAnalyst
        class MockHeuristics: pass
        sca = SemanticContextAnalyst(MockHeuristics())
        self.assertIsNotNone(sca)
        logger.info("✅ Smoke test concluído.")

    def test_classify_intent(self):
        """Valida a classificação de intenção (METADATA, OBSERVABILITY, LOGIC)."""
        logger.info("⚡ Testando classify_intent...")
        import ast
        from src_local.agents.Support.semantic_context_analyst import SemanticContextAnalyst
        from src_local.agents.Support.safety_heuristics import SafetyHeuristics
        from src_local.agents.Support.ast_navigator import ASTNavigator
        
        nav = ASTNavigator()
        heuristics = SafetyHeuristics(nav)
        sca = SemanticContextAnalyst(heuristics)

        # 1. METADATA: Em definição de regras
        tree = ast.parse("patterns = [r'eval\\(']")
        target = tree.body[0].value.elts[0]
        self.assertEqual(sca.classify_intent(target, tree), 'METADATA')

        # 2. OBSERVABILITY: Em log
        tree = ast.parse("logger.info('executing')")
        target = tree.body[0].value.args[0]
        self.assertEqual(sca.classify_intent(target, tree), 'OBSERVABILITY')

        # 3. LOGIC: Chamada solta
        tree = ast.parse("eval('1+1')")
        target = tree.body[0].value
        self.assertEqual(sca.classify_intent(target, tree), 'LOGIC')

        # 4. METADATA: Em teste
        tree = ast.parse("def test_logic(): eval('x')")
        target = tree.body[0].body[0].value
        self.assertEqual(sca.classify_intent(target, tree), 'METADATA')

        logger.info("✅ Classificação de intenção validada com 4 asserções.")

if __name__ == "__main__":
    unittest.main()
