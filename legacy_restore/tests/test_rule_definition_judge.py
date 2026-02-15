import unittest
import logging
from src_local.agents.Support.rule_definition_judge import *

# Configuração de telemetria
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestRule_definition_judge")

class TestRuledefinitionjudge(unittest.TestCase):
    def test_validate_safe_log(self):
        """Valida que strings em logs são consideradas seguras."""
        logger.info("⚡ Testando validação de log seguro...")
        import ast
        from unittest.mock import MagicMock
        
        judge = RuleDefinitionJudge()
        tree = ast.parse("logger.info('safe string')")
        node = tree.body[0].value.args[0]
        
        # Mock do ASTNavigator no validate
        with unittest.mock.patch("src_local.agents.Support.ast_navigator.ASTNavigator") as mock_nav_class:
            mock_nav = mock_nav_class.return_value
            mock_nav.safety_nav.is_safe_context.return_value = True
            
            valid, msg = judge.validate(node, tree)
            self.assertTrue(valid)
            self.assertIn("contexto seguro", msg)
        logger.info("✅ Validação de log concluída.")

    def test_validate_unsafe_exec(self):
        """Valida que strings executadas são consideradas perigosas."""
        logger.info("⚡ Testando validação de execução perigosa...")
        import ast
        judge = RuleDefinitionJudge()
        tree = ast.parse("eval('dangerous')")
        node = tree.body[0].value.args[0]
        
        with unittest.mock.patch("src_local.agents.Support.ast_navigator.ASTNavigator") as mock_nav_class:
            mock_nav = mock_nav_class.return_value
            mock_nav.safety_nav.is_safe_context.return_value = False
            mock_nav.safety_nav.is_being_executed.return_value = True
            
            valid, msg = judge.validate(node, tree)
            self.assertFalse(valid)
            self.assertIn("executada dinamicamente", msg)
        logger.info("✅ Detecção de execução perigosa validada.")

    def test_is_in_analyzer_context(self):
        """Valida a detecção de contexto de analisador."""
        logger.info("⚡ Testando detecção de contexto de analisador...")
        import ast
        judge = RuleDefinitionJudge()
        
        # Simula cadeia: Class(IntegrityGuardian) -> Function(audit)
        parent_chain = [
            ast.ClassDef(name="IntegrityGuardian", bases=[], keywords=[], body=[], decorator_list=[]),
            ast.FunctionDef(name="audit", args=None, body=[], decorator_list=[])
        ]
        
        self.assertTrue(judge.is_in_analyzer_context(parent_chain))
        
        # Contexto genérico não deve ser disparado
        generic_chain = [ast.FunctionDef(name="generic_fn", args=None, body=[], decorator_list=[])]
        self.assertFalse(judge.is_in_analyzer_context(generic_chain))
        logger.info("✅ Contexto de analisador validado.")

if __name__ == "__main__":
    unittest.main()
