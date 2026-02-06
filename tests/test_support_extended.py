import unittest
import ast
from src_local.agents.Support.ast_navigator import ASTNavigator
from src_local.agents.Support.safety_navigator import SafetyNavigator
from src_local.agents.Support.score_calculator import ScoreCalculator
from src_local.agents.Support.integrity_guardian import IntegrityGuardian

class TestSupportExtended(unittest.TestCase):
    def setUp(self):
        self.ast_nav = ASTNavigator()
        self.safety_nav = SafetyNavigator(self.ast_nav)
        self.scorer = ScoreCalculator()
        self.guardian = IntegrityGuardian()

    def test_ast_navigator_is_call_to(self):
        tree = ast.parse("eval('1+1')")
        call_node = tree.body[0].value
        self.assertTrue(self.ast_nav.is_call_to(call_node, ["eval"]))
        self.assertFalse(self.ast_nav.is_call_to(call_node, ["print"]))

    def test_safety_navigator_is_being_executed(self):
        content = "eval('dangerous')"
        tree = ast.parse(content)
        str_node = tree.body[0].value.args[0]
        self.assertTrue(self.safety_nav.is_being_executed(str_node, tree))

    def test_safety_navigator_is_safe_in_rule(self):
        content = "audit_rules = [{'regex': 'eval'}]"
        tree = ast.parse(content)
        # O nó eval está dentro da string no dicionário
        # Vamos encontrar o nó da string 'eval'
        for node in ast.walk(tree):
            if isinstance(node, (ast.Constant, getattr(ast, 'Str', ast.Constant))):
                val = getattr(node, 'value', getattr(node, 's', ''))
                if val == 'eval':
                    self.assertTrue(self.safety_nav.is_safe_context(node, tree))

    def test_score_calculator_basic(self):
        # Testamos o cálculo de score soberano
        metrics_map = {
            'file1.py': {'has_test': True, 'complexity': 1, 'component_type': 'CODE', 'telemetry': True, 'purpose': 'TEST'},
        }
        all_alerts = []
        score = self.scorer.calculate_final_score(metrics_map, all_alerts)
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)

    def test_integrity_guardian_production(self):
        # Simula código com fragilidade
        content = "eval(userInput)"
        issues = self.guardian.detect_vulnerabilities(content, "PRODUCTION")
        self.assertTrue(issues['brittle'])

    def test_integrity_guardian_test_bypass(self):
        # Código de teste não deve marcar como fragilidade
        content = "eval(userInput)"
        issues = self.guardian.detect_vulnerabilities(content, "TEST")
        self.assertFalse(issues['brittle'])
        
    def test_report_formatter_header(self):
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

if __name__ == '__main__':
    unittest.main()
