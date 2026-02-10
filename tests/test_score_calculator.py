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
        metrics = {'f1.py': {'has_test': True, 'complexity': 10, 'component_type': 'CODE', 'telemetry': True, 'purpose': 'X'}}
        score = scorer.calculate_final_score(metrics, [])
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)
        logger.info(f"✅ Pontuação base validada: {score}")

    def test_score_penalties(self):
        """Valida se as penalidades são aplicadas corretamente."""
        logger.info("⚡ Testando penalidades de score...")
        scorer = ScoreCalculator()
        
        # 1. Sem testes (Dark Matter)
        metrics_no_test = {'f1.py': {'has_test': False, 'complexity': 10, 'component_type': 'CODE', 'telemetry': True, 'purpose': 'X'}}
        score_low = scorer.calculate_final_score(metrics_no_test, [])
        
        # 2. Com testes (Saudável)
        metrics_with_test = {'f1.py': {'has_test': True, 'complexity': 10, 'component_type': 'CODE', 'telemetry': True, 'purpose': 'X'}}
        score_high = scorer.calculate_final_score(metrics_with_test, [])
        
        self.assertLess(score_low, score_high)
        
        # 3. Penalidade por testes SHALOW
        qa_data = {"matrix": [{"file": "f1.py", "test_status": "SHALLOW"}]}
        score_shallow = scorer.calculate_final_score(metrics_with_test, [], qa_data=qa_data)
        
        self.assertLess(score_shallow, score_high)
        logger.info(f"✅ Penalidades validadas: Base={score_high}, Shallow={score_shallow}, NoTest={score_low}")

if __name__ == '__main__':
    unittest.main()
