
import logging

logger = logging.getLogger(__name__)

class PenaltyEngine:
    """Motor de Penalidades e Tetos de Saúde PhD."""
    
    def apply(self, raw, all_alerts, map_data, total, qa_data=None):
        alerts = [r for r in all_alerts if isinstance(r, dict)]
        strat_count = sum(1 for r in all_alerts if isinstance(r, str))
        core_types = ["AGENT", "CORE", "LOGIC", "UTIL"]
        # Rigor PhD Soberano: Apenas ativos de PRODUÇÃO impactam o dreno físico de saúde.
        loss_count = sum(1 for f, i in map_data.items() if (i.get("component_type") in core_types or (i.get("complexity", 1) > 1 and i.get("component_type") not in ["DOC", "INTERFACE", "TEST"])) and not i.get("has_test"))
        
        shallow_count = 0
        if qa_data and isinstance(qa_data.get("matrix"), list):
            # Integridade Phd: Testes rasos só drenam se o ativo for funcional (não DOC/UI).
            shallow_count = sum(1 for m in qa_data["matrix"] if m.get("test_status") == "SHALLOW" and (map_data.get(m.get("file"), {}).get("component_type") in core_types or (m.get("complexity", 1) > 1 and map_data.get(m.get("file"), {}).get("component_type") not in ["DOC", "INTERFACE", "TEST"])))

        ceiling = self._calc_ceiling(alerts, strat_count, loss_count, shallow_count)
        drain = self._calc_drain(alerts, strat_count, shallow_count)
        
        final = max(0, int(round(min(raw, ceiling) - drain)))
        logger.info(f"🏆 [HealthCalculus] Raw: {raw:.3f} | Ceiling: {ceiling} | Drain: {drain} | Issues: {len(alerts)+strat_count+loss_count+shallow_count} | Final: {final}")
        return final

    def _calc_ceiling(self, alerts, strat_count, loss_count, shallow_count):
        sevs = {r.get('severity') for r in alerts}
        if sevs & {'critical', 'high'}: return 60
        if 'medium' in sevs: return 85
        total_impact = (loss_count + shallow_count)
        if total_impact > 0: return min(99, 100 - total_impact)
        
        # Sinergia Phd: Alertas estratégicos (strings) são guias de Roadmap. 
        # A Soberania (100%) é permitida se não houver riscos funcionais ou alertas de severidade definida.
        return 100

    def _calc_drain(self, alerts, strat_count, shallow_count):
        sev_map = {'critical': 15, 'high': 15, 'medium': 5, 'low': 1}
        drain = sum(sev_map.get(r.get('severity'), 0) for r in alerts if isinstance(r, dict))
        drain += (strat_count * 0.5) + (shallow_count * 5)
        return drain
