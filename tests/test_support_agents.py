import unittest
from src_local.agents.Support.integrity_guardian import IntegrityGuardian
from src_local.agents.Support.dna_profiler import DNAProfiler
from src_local.agents.Support.infrastructure_assembler import InfrastructureAssembler

class TestSupportAgents(unittest.TestCase):
    def setUp(self):
        self.guardian = IntegrityGuardian()
        self.dna = DNAProfiler()

    def test_integrity_guardian_silent_error(self):
        content = "try:\n    do_something()\nexcept:\n    pass"
        res = self.guardian.detect_vulnerabilities(content, "LOGIC", ignore_test_context=True)
        self.assertTrue(res["silent_error"])

    def test_integrity_guardian_injection(self):
        content = "eval('dangerous')"
        res = self.guardian.detect_vulnerabilities(content, "LOGIC", ignore_test_context=True)
        self.assertTrue(res["brittle"])

    def test_dna_profiler_identity(self):
        # Basic check
        identity = self.dna.discover_identity(None)
        self.assertIn("core_mission", identity)

    def test_infrastructure_assembler(self):
        support = InfrastructureAssembler.assemble_core_support()
        self.assertIn("analyst", support)
        self.assertIn("guardian", support)

if __name__ == "__main__":
    unittest.main()
