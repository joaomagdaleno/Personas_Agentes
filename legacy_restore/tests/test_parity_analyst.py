import unittest
import logging
from src_local.agents.Support.parity_analyst import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestParityAnalyst")

class TestParityanalyst(unittest.TestCase):
    def test_analyze_stack_gaps_success(self):
        """Valida a detecção de PhDs ausentes entre as stacks."""
        logger.info("⚡ Testando análise de gaps de paridade...")
        from unittest.mock import MagicMock
        
        # Simula agentes: Echo em Python, mas ausente nas outras
        p1 = MagicMock()
        p1.name = "Echo"
        p1.stack = "Python"
        p1.get_maturity_metrics.return_value = {"has_telemetry": True}
        
        p2 = MagicMock()
        p2.name = "Voyager"
        p2.stack = "Python"
        p2.get_maturity_metrics.return_value = {"has_telemetry": True}
        
        p3 = MagicMock()
        p3.name = "Voyager"
        p3.stack = "Flutter"
        p3.get_maturity_metrics.return_value = {"has_telemetry": False}
        
        analyst = ParityAnalyst()
        results = analyst.analyze_stack_gaps([p1, p2, p3])
        
        # Echo deve estar no gap da Flutter (p3 não é Echo)
        gaps = results["gaps"]
        self.assertTrue(any("Echo" in g and "Flutter" in g for g in gaps))
        self.assertEqual(results["stats"]["Python"]["telemetry"], 2)
        logger.info("✅ Gaps de paridade validados.")

if __name__ == "__main__":
    unittest.main()
