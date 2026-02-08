import unittest
import ast
import logging
from src_local.agents.Support.ast_navigator import ASTNavigator

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestASTNavigator")

class TestASTNavigator(unittest.TestCase):
    def setUp(self):
        self.nav = ASTNavigator()

    def test_is_call_to(self):
        logger.info("⚡ Testando detecção de chamadas AST...")
        tree = ast.parse("eval('1+1')")
        node = tree.body[0].value
        self.assertTrue(self.nav.is_call_to(node, ["eval"]))
        self.assertFalse(self.nav.is_call_to(node, ["print"]))
        logger.info("✅ Detecção de chamadas validada.")

if __name__ == '__main__':
    unittest.main()
