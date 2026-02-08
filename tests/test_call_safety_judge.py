import unittest
import logging
from src_local.agents.Support.call_safety_judge import *

# Configuração de telemetria
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestCall_safety_judge")

class TestCallsafetyjudge(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for call_safety_judge.py"""
        logger.info("⚡ Iniciando smoke test para call_safety_judge.py...")
        self.assertTrue(True)
        logger.info("✅ Smoke test concluído.")

if __name__ == "__main__":
    unittest.main()
