import unittest
import ast
from src_local.agents.Support.logic_node_auditor import LogicNodeAuditor
from src_local.agents.Support.ast_navigator import ASTNavigator
from src_local.agents.Support.safe_context_judge import SafeContextJudge
from src_local.agents.Support.call_safety_judge import CallSafetyJudge

class TestLogicNodeAuditor(unittest.TestCase):
    def setUp(self):
        self.nav = ASTNavigator()
        self.heuristics = self.nav.safety_nav.heuristics
        self.judge = SafeContextJudge()
        self.call_judge = CallSafetyJudge(self.judge)
        self.auditor = LogicNodeAuditor(self.heuristics, self.judge, self.call_judge)

    def test_audit_global_outside_rule(self):
        code = "global x"
        tree = ast.parse(code)
        node = tree.body[0]
        res, reason = self.auditor.audit(node, tree, code, 1, "brittle", False)
        self.assertFalse(res)
        self.assertIn("Uso de estado global", reason)

    def test_telemetry_check(self):
        # time identification
        code = "t = time.time() - start"
        tree = ast.parse(code)
        node = tree.body[0]
        res, reason = self.auditor.audit(node, tree, code, 1, "logic", False)
        # Should call TelemetryIntentJudge
        self.assertIsNotNone(res)

if __name__ == '__main__':
    unittest.main()
