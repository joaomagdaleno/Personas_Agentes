
import logging

logger = logging.getLogger(__name__)


class ScoreCalculator:
    """Calculadora de Métricas de Saúde (Desacoplamento de Complexidade)."""

    def __init__(self):
        from src_local.agents.Support.scoring_metrics_engine import ScoringMetricsEngine
        from src_local.agents.Support.penalty_engine import PenaltyEngine
        self.metrics_engine = ScoringMetricsEngine()
        self.penalty_engine = PenaltyEngine()

    def calculate_final_score(self, map_data, all_alerts, qa_data=None):
        if not map_data: return {"score": 0, "breakdown": {}}
        total = len(map_data)

        stability, _, _ = self.metrics_engine.calc_stability(map_data)
        purity, _ = self.metrics_engine.calc_purity(map_data, total)
        observability, _, _ = self.metrics_engine.calc_observability(map_data)
        security, _ = self.metrics_engine.calc_security(all_alerts)
        excellence, _ = self.metrics_engine.calc_excellence(map_data, total)

        raw = stability + purity + observability + security + excellence
        final_score = self.penalty_engine.apply(raw, all_alerts, map_data, total, qa_data)
        
        # Sincronia de Breakdown: Aplica os mesmos drenos do PenaltyEngine no breakdown visual.
        adjustments = self.penalty_engine.get_pilar_adjustments(all_alerts, map_data, qa_data)
        
        # Ajuste Fino: Se o final_score for menor que raw devido ao teto global, 
        # distribuímos a perda proporcionalmente ou no pilar mais crítico.
        # Aqui, aplicamos os drenos específicos primeiro.
        
        return {
            "score": final_score,
            "breakdown": {
                "Stability (Coverage)": round(max(0, stability - adjustments.get("Stability (Coverage)", 0)), 1),
                "Purity (Complexity)": round(max(0, purity - adjustments.get("Purity (Complexity)", 0)), 1),
                "Observability (Telemetry)": round(observability, 1),
                "Security (Vulnerabilities)": round(max(0, security - adjustments.get("Security (Vulnerabilities)", 0)), 1),
                "Excellence (Documentation)": round(max(0, excellence - adjustments.get("Excellence (Documentation)", 0)), 1)
            }
        }
