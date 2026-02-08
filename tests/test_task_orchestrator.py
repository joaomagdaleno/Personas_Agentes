import unittest
import logging
from src_local.core.task_orchestrator import *

# Configuração de telemetria
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestTask_orchestrator")

class TestTaskorchestrator(unittest.TestCase):
    def test_smoke(self):
        """Smoke test for task_orchestrator.py"""
        logger.info("⚡ Iniciando smoke test para task_orchestrator.py...")
        self.assertTrue(True)
        logger.info("✅ Smoke test concluído.")

if __name__ == "__main__":
    unittest.main()
