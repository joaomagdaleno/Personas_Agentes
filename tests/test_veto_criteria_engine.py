"""Testes para VetoCriteriaEngine"""
import unittest
import logging

logger = logging.getLogger("test_veto_criteria_engine")

class TestVetoCriteriaEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.veto_criteria_engine import VetoCriteriaEngine
        self.engine = VetoCriteriaEngine()

    def test_is_math_context(self):
        p = {"issue": "Imprecisão Monetária", "regex": "float"}
        self.assertTrue(self.engine.is_math_context("alpha = sin(x)", p))
        
        # Test 2: Another context
        self.assertTrue(self.engine.is_math_context("y = sqrt(9)", p))
        # Test 3: Non-math context
        self.assertFalse(self.engine.is_math_context("msg = 'hello'", p))

if __name__ == '__main__': unittest.main()
