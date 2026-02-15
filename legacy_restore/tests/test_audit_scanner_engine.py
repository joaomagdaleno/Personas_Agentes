"""Testes para AuditScannerEngine"""
import unittest
import logging

logger = logging.getLogger("test_audit_scanner_engine")

class TestAuditScannerEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.audit_scanner_engine import AuditScannerEngine
        self.engine = AuditScannerEngine()

    def test_is_error_report(self):
        self.assertTrue(self.engine._is_error_report(["logger.error('x')", "y"], 0))
        self.assertFalse(self.engine._is_error_report(["x = 1", "y = 2"], 0))

    def test_parse_severity(self):
        self.assertEqual(self.engine._parse_severity("[Severity: HIGH]"), "HIGH")
        self.assertEqual(self.engine._parse_severity("STRATEGIC level"), "STRATEGIC")

if __name__ == '__main__': unittest.main()
