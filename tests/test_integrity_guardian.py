import unittest
from src_local.agents.Support.integrity_guardian import IntegrityGuardian

class TestIntegrityGuardian(unittest.TestCase):
    def test_vulnerabilities(self):
        guardian = IntegrityGuardian()
        issues = guardian.detect_vulnerabilities("eval(x)", "PRODUCTION")
        self.assertTrue(issues['brittle'])

if __name__ == '__main__':
    unittest.main()
