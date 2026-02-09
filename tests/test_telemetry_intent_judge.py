import unittest
import logging
from src_local.agents.Support.telemetry_intent_judge import *

# Configuração de telemetria
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestTelemetry_intent_judge")

class TestTelemetryintentjudge(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for telemetry_intent_judge.py"""
        logger.info("⚡ Iniciando smoke test para telemetry_intent_judge.py...")
        self.assertTrue(True)
        logger.info("✅ Smoke test concluído.")

if __name__ == "__main__":
    unittest.main()
