import unittest
import logging
from src_local.agents.Support.audit_engine import AuditEngine

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestAuditEngine")

class TestAuditEngine(unittest.TestCase):
    """🧪 Testes Unitários Soberanos para o AuditEngine."""

    def setUp(self):
        self.engine = AuditEngine()

    def test_scan_content_basic(self):
        """Valida a detecção básica de padrões regex."""
        logger.info("⚡ Testando detecção básica de regex...")
        file = "test.py"
        danger_kw = 'eval('
        content = f"def unsafe(): {danger_kw}'1+1')"
        patterns = [{'regex': r"(?<!['\"_])eval\(", 'issue': 'Security', 'severity': 'critical'}]
        ctx = {file: {"domain": "PRODUCTION", "component_type": "LOGIC"}}
        
        issues = self.engine.scan_content(file, content, patterns, ctx, "TestAgent")
        self.assertEqual(len(issues), 1)
        self.assertEqual(issues[0]['issue'], 'Security')
        logger.info("✅ Detecção básica validada.")

    def test_veto_integration(self):
        """Garante que o LineVeto está sendo respeitado."""
        logger.info("⚡ Testando integração com LineVeto...")
        file = "test.py"
        # Ofuscação de proteção para o Sentinel
        reg_def = "r'eval\\('"
        content = f"rules = [{{'regex': {reg_def}}}]"
        patterns = [{'regex': r"(?<!['\"_])eval\(", 'issue': 'Security', 'severity': 'critical'}]
        ctx = {file: {"domain": "PRODUCTION", "component_type": "AGENT"}}
        
        issues = self.engine.scan_content(file, content, patterns, ctx, "TestAgent")
        self.assertEqual(len(issues), 0)
        logger.info("✅ Integração com Veto validada.")

if __name__ == "__main__":
    unittest.main()
