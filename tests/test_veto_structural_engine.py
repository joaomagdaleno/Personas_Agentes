"""Testes para VetoStructuralEngine"""
import unittest
import logging

logger = logging.getLogger("test_veto_structural_engine")

class TestVetoStructuralEngine(unittest.TestCase):
    def setUp(self):
        from src_local.agents.Support.veto_structural_engine import VetoStructuralEngine
        self.engine = VetoStructuralEngine()

    def test_is_comment(self):
        self.assertTrue(self.engine.is_comment("# Comment"))
        self.assertFalse(self.engine.is_comment("code = 1"))

if __name__ == '__main__': unittest.main()
