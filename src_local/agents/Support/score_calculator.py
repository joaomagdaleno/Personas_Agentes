
import logging

logger = logging.getLogger(__name__)

class ScoreCalculator:
    """Calculadora de Métricas de Saúde (Desacoplamento de Complexidade)."""

    def calculate_final_score(self, map_data, all_alerts, qa_data=None):
        total_files = len(map_data)
        if total_files == 0:
            logger.debug("No files to calculate score.")
            return {"score": 0, "breakdown": {}}

        stability = self._calc_stability(map_data, total_files)
        purity = self._calc_purity(map_data, total_files)
        observability = self._calc_observability(map_data, total_files)
        security = self._calc_security(all_alerts)
        excellence = self._calc_excellence(map_data, total_files)

        raw = stability + purity + observability + security + excellence
        logger.debug(f"Raw health score: {raw}")
        
        final_score = self._apply_penalties(raw, all_alerts, map_data, total_files, qa_data)
        
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

    def _calc_stability(self, map_data, total):
        test_files = sum(1 for f, i in map_data.items() if i.get("has_test"))
        score = (test_files / total) * 40
        logger.debug(f"Stability score: {score}")
        return score

    def _calc_purity(self, map_data, total):
        avg_complexity = sum(i.get("complexity", 1) for i in map_data.values()) / total
        score = max(0, 20 - ((avg_complexity - 1) * 1.5))
        logger.debug(f"Purity score (avg complexity {avg_complexity}): {score}")
        return score

    def _calc_observability(self, map_data, total):
        tel_count = sum(1 for f, i in map_data.items() if i.get("component_type") != "TEST" and (i.get("telemetry") or "telemetry" in str(i)))
        score = (tel_count / max(1, total)) * 15
        logger.debug(f"Observability score: {score}")
        return score

    def _calc_security(self, all_alerts):
        high = [r for r in all_alerts if isinstance(r, dict) and r.get('severity') in ['critical', 'high']]
        score = max(0, 15 - (len(high) * 5))
        logger.debug(f"Security score (high alerts {len(high)}): {score}")
        return score

    def _calc_excellence(self, map_data, total):
        kdoc = sum(1 for f, i in map_data.items() if i.get("purpose") != "UNKNOWN")
        score = (kdoc / total) * 10
        logger.debug(f"Excellence score: {score}")
        return score

    def _apply_penalties(self, raw, all_alerts, map_data, total, qa_data=None):
        # Filtro de Integridade: Todas as falhas reais drenam a saúde
        alerts = [r for r in all_alerts if isinstance(r, dict)]
        strat_count = sum(1 for r in all_alerts if isinstance(r, str))
        loss_count = sum(1 for f, i in map_data.items() if not i.get("has_test"))
        shallow_count = self._get_shallow_test_count(qa_data)

        ceiling = self._calculate_health_ceiling(alerts, strat_count, loss_count, shallow_count)
        drain = self._calculate_total_drain(alerts, strat_count, shallow_count)
        
        final = max(0, int(min(raw, ceiling) - drain))
        logger.debug(f"Applied penalties. Drain: {drain}, Ceiling: {ceiling}, Final Score: {final}")
        return final

    def _get_shallow_test_count(self, qa_data):
        if not qa_data or "matrix" not in qa_data: return 0
        return sum(1 for m in qa_data["matrix"] if m.get("test_status") == "SHALLOW")

    def _calculate_health_ceiling(self, alerts, strat_count, loss_count, shallow_count):
        high_alerts = [r for r in alerts if r.get('severity') in ['critical', 'high']]
        medium_alerts = [r for r in alerts if r.get('severity') == 'medium']
        
        if high_alerts: return 60
        if medium_alerts: return 85
        if strat_count > 0 or loss_count > 0 or shallow_count > 0: return 99
        return 100

    def _calculate_total_drain(self, alerts, strat_count, shallow_count):
        severity_map = {'critical': 15, 'high': 15, 'medium': 5, 'low': 1}
        drain = sum(severity_map.get(r.get('severity'), 0) for r in alerts if isinstance(r, dict))
        drain += (strat_count * 0.5) + (shallow_count * 5)
        return drain
