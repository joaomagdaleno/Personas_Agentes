import unittest
import logging
from src_local.agents.Support.rule_definition_judge import *

# Configuração de telemetria
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestRule_definition_judge")

class TestRuledefinitionjudge(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for rule_definition_judge.py"""
        logger.info("⚡ Iniciando smoke test para rule_definition_judge.py...")
        self.assertTrue(True)
        logger.info("✅ Smoke test concluído.")

if __name__ == "__main__":
    unittest.main()
