import unittest
import ast
import logging
from src_local.agents.Support.ast_navigator import ASTNavigator
from src_local.agents.Support.safety_navigator import SafetyNavigator
from src_local.agents.Support.score_calculator import ScoreCalculator
from src_local.agents.Support.integrity_guardian import IntegrityGuardian

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestSupportExtended")

class TestSupportExtended(unittest.TestCase):
    def setUp(self):
        self.ast_nav = ASTNavigator()
        self.safety_nav = SafetyNavigator(self.ast_nav)
        self.scorer = ScoreCalculator()
        self.guardian = IntegrityGuardian()

    def test_ast_navigator_is_call_to(self):
        logger.info("⚡ Testando is_call_to...")
        tree = ast.parse("eval('1+1')")
        call_node = tree.body[0].value
        self.assertTrue(self.ast_nav.is_call_to(call_node, ["eval"]))
        self.assertFalse(self.ast_nav.is_call_to(call_node, ["print"]))
        logger.info("✅ is_call_to validado.")

    def test_safety_navigator_is_being_executed(self):
        logger.info("⚡ Testando is_being_executed...")
        content = "eval('dangerous')"
        tree = ast.parse(content)
        str_node = tree.body[0].value.args[0]
        self.assertTrue(self.safety_nav.is_being_executed(str_node, tree))
        logger.info("✅ is_being_executed validado.")

    def test_safety_navigator_is_safe_in_rule(self):
        logger.info("⚡ Testando segurança em definição de regra...")
        content = "audit_rules = [{'regex': 'eval'}]"
        tree = ast.parse(content)
        # O nó eval está dentro da string no dicionário
        # Vamos encontrar o nó da string 'eval'
        found = False
        for node in ast.walk(tree):
            if isinstance(node, (ast.Constant, getattr(ast, 'Str', ast.Constant))):
                val = getattr(node, 'value', getattr(node, 's', ''))
                if val == 'eval':
                    self.assertTrue(self.safety_nav.is_safe_context(node, tree))
                    found = True
        self.assertTrue(found)
        logger.info("✅ Segurança em regra validada.")

    def test_score_calculator_basic(self):
        logger.info("⚡ Testando ScoreCalculator...")
        # Testamos o cálculo de score soberano
        metrics_map = {
            'file1.py': {'has_test': True, 'complexity': 1, 'component_type': 'CODE', 'telemetry': True, 'purpose': 'TEST'},
        }
        all_alerts = []
        score = self.scorer.calculate_final_score(metrics_map, all_alerts)
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)
        logger.info(f"✅ ScoreCalculator validado: {score}")

    def test_integrity_guardian_production(self):
        logger.info("⚡ Testando IntegrityGuardian em produção...")
        # Simula código com fragilidade
        content = "eval(userInput)"
        issues = self.guardian.detect_vulnerabilities(content, "PRODUCTION", ignore_test_context=True)
        self.assertTrue(issues['brittle'])
        logger.info("✅ Detecção em produção validada.")

    def test_integrity_guardian_test_bypass(self):
        logger.info("⚡ Testando bypass do IntegrityGuardian em testes...")
        # Código de teste não deve marcar como fragilidade por padrão
        content = "eval(userInput)"
        # No guardião, o component_type "TEST" ativa o bypass automático internamente?
        # Não, agora usamos ignore_test_context.
        issues = self.guardian.detect_vulnerabilities(content, "TEST", ignore_test_context=False)
        self.assertFalse(issues['brittle'])
        logger.info("✅ Bypass em testes validado.")
        
    def test_report_formatter_header(self):
        logger.info("⚡ Testando formatação de cabeçalho...")
        from src_local.agents.Support.report_formatter import ReportFormatter
        formatter = ReportFormatter()
        data = {
            'objective': 'Test Mission',
            'health_score': 95,
            'total_issues': 0,
            'parity': {'gaps': []}
        }
        header = formatter.format_header(data)
        self.assertIn("Test Mission", header)
        self.assertIn("95%", header)
        logger.info("✅ Cabeçalho validado.")

if __name__ == '__main__':
    unittest.main()
