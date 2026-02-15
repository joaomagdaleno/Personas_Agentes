import unittest
import ast
from src_local.agents.Support.logic_auditor import LogicAuditor
from src_local.agents.Support.safety_heuristics import SafetyHeuristics
from src_local.agents.Support.semantic_context_analyst import SemanticContextAnalyst

class TestContextSovereignty(unittest.TestCase):
    """Testes de Soberania de Contexto: Garante que auditores não se auto-flagueiem."""
    
    def setUp(self):
        self.auditor = LogicAuditor()

    def test_meta_analysis_isinstance_is_safe(self):
        """Verifica que isinstance(node, ast.Global) é classificado como METADATA."""
        code = """
if isinstance(node, ast.Global):
    return False, "Uso de estado global detectado."
"""
        res, reason = self.auditor.is_interaction_safe(code, 2, "global")
        self.assertTrue(res)
        self.assertIn("segura", reason.lower())

    def test_string_comparison_analysis_is_safe(self):
        """Verifica que '"time.time()" in content' é classificado como METADATA."""
        code = """
evidences = {
    "has_telemetry": "time.time()" in content or "_log_performance" in content,
}
"""
        res, reason = self.auditor.is_interaction_safe(code, 3, "strategic")
        self.assertTrue(res)
        self.assertIn("segura", reason.lower())

    def test_real_global_still_detected(self):
        """Garante que uso REAL de global ainda é detectado."""
        code = """
global my_var
my_var = 10
"""
        res, reason = self.auditor.is_interaction_safe(code, 2, "brittle", ignore_test_context=True)
        self.assertFalse(res)

if __name__ == "__main__":
    unittest.main()
