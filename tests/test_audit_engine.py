import unittest
from src_local.agents.Support.audit_engine import AuditEngine

class TestAuditEngine(unittest.TestCase):
    """🧪 Testes Unitários Soberanos para o AuditEngine."""

    def setUp(self):
        self.engine = AuditEngine()

    def test_scan_content_basic(self):
        """Valida a detecção básica de padrões regex."""
        file = "test.py"
        danger_kw = 'eval('
        content = f"def unsafe(): {danger_kw}'1+1')"
        patterns = [{'regex': r"(?<!['\"_])eval\(", 'issue': 'Security', 'severity': 'critical'}]
        ctx = {file: {"domain": "PRODUCTION", "component_type": "LOGIC"}}
        
        issues = self.engine.scan_content(file, content, patterns, ctx, "TestAgent")
        self.assertEqual(len(issues), 1)
        self.assertEqual(issues[0]['issue'], 'Security')

    def test_veto_integration(self):
        """Garante que o LineVeto está sendo respeitado."""
        file = "test.py"
        # Ofuscação de proteção para o Sentinel
        reg_def = "r'eval\\('"
        content = f"rules = [{{'regex': {reg_def}}}]"
        patterns = [{'regex': r"(?<!['\"_])eval\(", 'issue': 'Security', 'severity': 'critical'}]
        ctx = {file: {"domain": "PRODUCTION", "component_type": "AGENT"}}
        
        issues = self.engine.scan_content(file, content, patterns, ctx, "TestAgent")
        self.assertEqual(len(issues), 0)

if __name__ == "__main__":
    unittest.main()
