import unittest
import ast
from src_local.agents.Support.logic_auditor import LogicAuditor
from src_local.agents.Support.safety_heuristics import SafetyHeuristics
from src_local.agents.Support.telemetry_intent_judge import TelemetryIntentJudge

class TestSupportComplexityFix(unittest.TestCase):
    def setUp(self):
        self.auditor = LogicAuditor()
        
    def test_delegated_logic_node_auditing(self):
        """Garante que o LogicAuditor ainda detecta riscos via LogicNodeAuditor."""
        code = "import os; os.system('ls')"
        res, reason = self.auditor.is_interaction_safe(code, 1, "dangerous")
        self.assertFalse(res)
        self.assertTrue("risco" in reason.lower() or "dangerous" in reason.lower())


    def test_refactored_telemetry_intent(self):
        """Valida que a telemetria manual em lógica ainda é detectada."""
        code = "t = time.time() - start_t"
        res, reason = self.auditor.is_interaction_safe(code, 1, "strategic")
        self.assertFalse(res)
        self.assertIn("telemetria manual", reason.lower())

    def test_safe_metadata_definition(self):
        """Valida que definições de metadados continuam seguras."""
        code = "rule = 'dangerous_pattern'"
        res, reason = self.auditor.is_interaction_safe(code, 1, "metadata")
        self.assertTrue(res)
        self.assertIn("segura", reason.lower())

if __name__ == "__main__":
    unittest.main()
