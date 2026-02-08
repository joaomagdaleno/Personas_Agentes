import unittest
import logging
from src_local.agents.Support.integrity_guardian import IntegrityGuardian
from src_local.agents.Support.dna_profiler import DNAProfiler
from src_local.agents.Support.infrastructure_assembler import InfrastructureAssembler

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestSupportAgents")

class TestSupportAgents(unittest.TestCase):
    def setUp(self):
        self.guardian = IntegrityGuardian()
        self.dna = DNAProfiler()

    def test_integrity_guardian_silent_error(self):
        logger.info("⚡ Testando detecção de erro silenciado (IntegrityGuardian)...")
        content = "try:\n    do_something()\nexcept:\n    pass"
        res = self.guardian.detect_vulnerabilities(content, "LOGIC", ignore_test_context=True)
        self.assertTrue(res["silent_error"])
        logger.info("✅ Erro silenciado detectado.")

    def test_integrity_guardian_injection(self):
        logger.info("⚡ Testando detecção de injeção (IntegrityGuardian)...")
        content = "eval('dangerous')"
        res = self.guardian.detect_vulnerabilities(content, "LOGIC", ignore_test_context=True)
        self.assertTrue(res["brittle"])
        logger.info("✅ Injeção detectada.")

    def test_dna_profiler_identity(self):
        logger.info("⚡ Testando descoberta de identidade (DNAProfiler)...")
        # Basic check
        identity = self.dna.discover_identity(None)
        self.assertIn("core_mission", identity)
        logger.info("✅ Identidade validada.")

    def test_infrastructure_assembler(self):
        logger.info("⚡ Testando montagem de infraestrutura...")
        support = InfrastructureAssembler.assemble_core_support()
        self.assertIn("analyst", support)
        self.assertIn("guardian", support)
        logger.info("✅ Infraestrutura validada.")

if __name__ == "__main__":
    unittest.main()
