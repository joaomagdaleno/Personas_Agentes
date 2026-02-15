import unittest
import ast
import logging
from src_local.agents.Support.ast_navigator import ASTNavigator
from src_local.agents.Support.safety_navigator import SafetyNavigator

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestSafetyNavigator")

class TestSafetyNavigator(unittest.TestCase):
    def setUp(self):
        self.ast_nav = ASTNavigator()
        self.nav = SafetyNavigator(self.ast_nav)

    def test_is_safe_in_rule(self):
        logger.info("⚡ Testando segurança de contexto em regras (SafetyNavigator)...")
        content = "audit_rules = [{'regex': 'eval'}]"
        tree = ast.parse(content)
        # Encontra o nó 'eval'
        for node in ast.walk(tree):
            if isinstance(node, ast.Constant) and node.value == 'eval':
                self.assertTrue(self.nav.is_safe_context(node, tree))
        logger.info("✅ Segurança de contexto validada.")

if __name__ == '__main__':
    unittest.main()
