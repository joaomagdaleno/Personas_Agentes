import unittest
import logging
from unittest.mock import MagicMock
from src_local.agents.Support.health_synthesizer import HealthSynthesizer

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestHealthSynthesizerDeep")

class TestHealthSynthesizerDeep(unittest.TestCase):
    """Bateria de Testes PhD para o Sintetizador de Saúde 🩺"""
    
    def setUp(self):
        self.synthesizer = HealthSynthesizer()

    def test_score_calculation(self):
        """Valida o algoritmo de pontuação de saúde PhD 3.0."""
        logger.info("⚡ Testando cálculo de score rigoroso...")
        # 1. Saúde perfeita: Sem alertas, complexidade 1, 100% telemetria, 100% testes
        map_data = {"f1": {"has_test": True, "complexity": 1, "component_type": "LOGIC", "purpose": "CORE"}}
        # Injetamos 'telemetry' na string do dado para o motor detectar
        map_data["f1"]["telemetry_call"] = "telemetry.trackEvent"
        
        score_100 = self.synthesizer._calculate_rigorous_3_0(map_data, [], 0)
        self.assertEqual(score_100, 100)
        
        # 2. Veto por alerta HIGH
        score_veto = self.synthesizer._calculate_rigorous_3_0(map_data, [{"severity": "high"}], 0)
        self.assertLessEqual(score_veto, 60)
        logger.info("✅ Cálculo de score validado.")

    def test_full_synthesis(self):
        """Valida a síntese 360º (Mockada) sob Rigor Soberano."""
        logger.info("⚡ Testando síntese 360 completa...")
        # Setup satisfazendo todos os pilares PhD 3.0
        context = {
            "identity": {"core_mission": "Test", "is_external": False}, 
            "map": {"f1": {"has_test": True, "complexity": 1, "purpose": "CORE", "component_type": "CORE"}}
        }
        # Injeção de telemetria simulada no mapa
        context["map"]["f1"]["metadata"] = "telemetry.track"
        
        qa_data = {"success": True, "pass_rate": 100, "total_run": 10, "failed": 0, "pyramid": {}, "execution": {"success": True, "failed": 0}}
        orchestrator_metrics = {}
        
        res = self.synthesizer.synthesize_360(context, orchestrator_metrics, [], MagicMock(), qa_data)
        self.assertEqual(res["health_score"], 100)
        self.assertEqual(res["objective"], "Test")
        logger.info("✅ Síntese 360 validada.")
