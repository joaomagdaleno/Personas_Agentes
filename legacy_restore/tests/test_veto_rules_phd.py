import unittest
import logging
from src_local.utils.veto_rules_phd import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestVetoRulesPhD")

class TestVetorulesphd(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for veto_rules_phd.py"""
        logger.info("⚡ Iniciando smoke test de VetoRulesPhD...")
        from src_local.agents.Support.veto_rules import VetoRules
        vr = VetoRules()
        self.assertIsNotNone(vr)
        logger.info("✅ Smoke test concluído.")

    def test_veto_logic(self):
        """Valida a lógica de veto para diferentes contextos."""
        logger.info("⚡ Testando lógica de veto...")
        from src_local.agents.Support.veto_rules import VetoRules
        vr = VetoRules()

        # 1. Testar check_test_permissions
        self.assertTrue(vr.check_test_permissions("'eval('", {'regex': 'eval('}, "tests/test_sample.py"))
        self.assertFalse(vr.check_test_permissions("eval('1+1')", {'regex': 'eval('}, "src/main.py"))

        # 2. Testar is_technical_math_context
        pattern = {'issue': 'Imprecisão Monetária'}
        self.assertTrue(vr.is_technical_math_context("radius = 10", pattern))
        self.assertFalse(vr.is_technical_math_context("price = 10", pattern))

        # 3. Testar is_rule_definition
        ctx = {"is_technical": True}
        class MockHeuristic: 
            def is_strategic_phrase(self, l): return False
            def is_obfuscated_vulnerability(self, l): return False
        
        self.assertTrue(vr.is_rule_definition("rules = [r'eval\\(']", {'regex': r'eval\('}, ctx, MockHeuristic()))
        self.assertFalse(vr.is_rule_definition("eval(x)", {'regex': r'eval\('}, {"is_technical": False}, MockHeuristic()))

        logger.info("✅ Lógica de veto validada com 5 asserções.")

if __name__ == "__main__":
    unittest.main()
