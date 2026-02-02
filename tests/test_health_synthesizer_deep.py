import unittest
from unittest.mock import MagicMock
from src.agents.Support.health_synthesizer import HealthSynthesizer

class TestHealthSynthesizerDeep(unittest.TestCase):
    """Bateria de Testes PhD para o Sintetizador de Saúde 🩺"""
    
    def setUp(self):
        self.synthesizer = HealthSynthesizer()

    def test_score_calculation(self):
        """Valida o algoritmo de pontuação de saúde."""
        # 1. Saúde perfeita
        score_100 = self.synthesizer._calculate_score(0, 0)
        self.assertEqual(score_100, 100)
        
        # 2. Risco moderado
        score_med = self.synthesizer._calculate_score(2, 5)
        self.assertLess(score_med, 100)
        self.assertGreater(score_med, 0)

    def test_vitals_extraction(self):
        """Valida a extração de sinais vitais do mapa."""
        map_data = {
            "src/core.py": {"brittle": True, "silent_error": True},
            "src/util.py": {"brittle": False, "silent_error": False}
        }
        ledger = MagicMock()
        ledger.get_file_data.return_value = {"occurrences": 0}
        
        vitals = self.synthesizer._get_vitals(map_data, ledger)
        self.assertIn("src/core.py", vitals["blind_spots"])
        # Verifica se o arquivo está na lista de dicionários de brittle_points
        self.assertTrue(any(item["file"] == "src/core.py" for item in vitals["brittle_points"]))
        self.assertEqual(len(vitals["blind_spots"]), 1)

    def test_full_synthesis(self):
        """Valida a síntese 360º (Mockada)."""
        context = {"identity": {"core_mission": "Test"}, "map": {}}
        qa_data = {"success": True, "pass_rate": 100, "total_run": 10, "failed": 0, "pyramid": {}, "execution": {}}
        orchestrator_metrics = {"health_score": 100}
        
        res = self.synthesizer.synthesize_360(context, orchestrator_metrics, [], MagicMock(), qa_data)
        self.assertEqual(res["health_score"], 100)
        self.assertEqual(res["objective"], "Test")
        self.assertIn("timestamp", res)
