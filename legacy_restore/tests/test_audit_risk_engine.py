"""Testes para AuditRiskEngine"""
import unittest
import logging

logger = logging.getLogger("test_audit_risk_engine")

class TestAuditRiskEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.audit_risk_engine import AuditRiskEngine
        self.engine = AuditRiskEngine()

    def test_map_risk_type(self):
        self.assertEqual(self.engine.map_risk_type("eval"), "eval")
        self.assertEqual(self.engine.map_risk_type("shell_exec"), "shell")
        self.assertIsInstance(self.engine.map_risk_type("unknown"), str)

    def test_create_entry(self):
        ctx = {"lines": ["a", "b", "c"], "agent_name": "Auditor"}
        p = {"issue": "Eval inseguro", "severity": "critical"}
        entry = self.engine.create_entry("test.py", 0, p, ctx, "HIGH")
        self.assertEqual(entry["file"], "test.py")
        self.assertEqual(entry["severity"], "HIGH")

if __name__ == '__main__': unittest.main()
