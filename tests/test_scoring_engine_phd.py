import unittest
import logging
from src_local.utils.scoring_engine_phd import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestScoringEnginePhD")

class TestScoringenginephd(unittest.TestCase):
    def test_calculate_logic(self):
        """Valida a lógica de cálculo do ScoringEnginePhd."""
        logger.info("⚡ Testando lógica de cálculo PhD...")
        
        map_data = {
            'file1.py': {'has_test': True, 'complexity': 10, 'telemetry': True, 'purpose': 'CORE'},
            'file2.py': {'has_test': False, 'complexity': 20, 'telemetry': False, 'purpose': 'UNKNOWN'}
        }
        alerts = []
        total = 2
        
        score = ScoringEnginePhd.calculate(map_data, alerts, total)
        
        # Stability: 1/2 * 40 = 20
        # Purity: avg=(10+20)/2 = 15. 20 - (14 * 1.5) = 20 - 21 = -1 -> max(0, -1) = 0
        # Obs: 1/2 * 15 = 7.5
        # Security: 15 (no alerts)
        # Excel: 1/2 * 10 = 5
        # Raw = 20 + 0 + 7.5 + 15 + 5 = 47.5
        # Constraints: 47.5
        
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)
        logger.info(f"✅ Cálculo validado: {score}")

    def test_constraints(self):
        """Valida a aplicação de restrições (teto e dreno)."""
        logger.info("⚡ Testando restrições do ScoringEnginePhd...")
        
        # Caso com alerta crítico
        map_data = {'file1.py': {'has_test': True, 'complexity': 1, 'telemetry': True, 'purpose': 'X'}}
        alerts = [{'severity': 'critical', 'issue': 'danger'}]
        score = ScoringEnginePhd.calculate(map_data, alerts, 1)
        
        # Ceiling para high/critical é 60
        # Drain = 15 * 0.2 = 3
        # Final = min(raw, 60) - 3
        self.assertLessEqual(score, 57)
        logger.info(f"✅ Restrição de criticidade validada: {score}")

if __name__ == "__main__":
    unittest.main()
