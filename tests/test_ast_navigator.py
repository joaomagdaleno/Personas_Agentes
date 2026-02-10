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

    def test_parent_chain(self):
        """Valida a extração da cadeia de ancestrais."""
        logger.info("⚡ Testando parent_chain...")
        tree = ast.parse("x = {'y': eval('1')}")
        # target é o eval
        target = tree.body[0].value.values[0]
        chain = self.nav.get_parent_chain(target, tree)
        self.assertTrue(any(isinstance(p, ast.Assign) for p in chain))
        self.assertTrue(any(isinstance(p, ast.Dict) for p in chain))
        logger.info("✅ Cadeia de ancestrais validada.")

    def test_dict_value(self):
        """Valida detecção de nó dentro de valores específicos de dicionário."""
        logger.info("⚡ Testando is_in_dict_value...")
        tree = ast.parse("config = {'regex': 'eval(', 'other': 'val'}")
        d_node = tree.body[0].value
        target = d_node.values[0] # 'eval('
        self.assertTrue(self.nav.is_in_dict_value(d_node, target, ["regex"]))
        self.assertFalse(self.nav.is_in_dict_value(d_node, target, ["other"]))
        logger.info("✅ Localização em dicionário validada.")

if __name__ == '__main__':
    unittest.main()
