
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
        
        # A soberania técnica (100%) é permitida se não houver alertas críticos/médios.
        return {
            "score": final_score,
            "breakdown": {
                "Stability (Coverage)": round(stability, 1),
                "Purity (Complexity)": round(purity, 1),
                "Observability (Telemetry)": round(observability, 1),
                "Security (Vulnerabilities)": round(security, 1),
                "Excellence (Documentation)": round(excellence, 1)
            }
        }
