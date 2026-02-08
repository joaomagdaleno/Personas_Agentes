import unittest
import logging
from src_local.agents.Support.score_calculator import ScoreCalculator

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestScoreCalculator")

class TestScoreCalculator(unittest.TestCase):
    def test_calculate_final_score(self):
        logger.info("⚡ Testando cálculo de pontuação final...")
        scorer = ScoreCalculator()
        metrics = {'f1.py': {'has_test': True, 'complexity': 1, 'component_type': 'CODE', 'telemetry': True, 'purpose': 'X'}}
        score = scorer.calculate_final_score(metrics, [])
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)
        logger.info(f"✅ Pontuação validada: {score}")

if __name__ == '__main__':
    unittest.main()
