
import logging

logger = logging.getLogger(__name__)

class PenaltyEngine:
    """Motor de Penalidades e Tetos de Saúde PhD."""
    
    def apply(self, raw, all_alerts, map_data, total, qa_data=None):
        adjustments = self.get_pilar_adjustments(all_alerts, map_data, qa_data)
        
        # O dreno total é a soma de todos os ajustes individuais + o impacto do teto global
        total_drain = sum(adjustments.values())
        
        # Fator de Teto Soberano (Se houver qualquer problema, o máximo é 99)
        ceiling = 100
        alerts = [r for r in all_alerts if isinstance(r, dict)]
        sevs = {r.get('severity') for r in alerts}
        if sevs & {'critical', 'high'}: ceiling = 60
        elif 'medium' in sevs: ceiling = 85
        elif total_drain > 0: ceiling = 99

        final = max(0, int(round(min(raw, ceiling) - total_drain)))
        logger.info(f"🏆 [HealthCalculus] Raw: {raw:.3f} | Ceiling: {ceiling} | Drain: {total_drain} | Final: {final}")
        return final

    def get_pilar_adjustments(self, all_alerts, map_data, qa_data=None):
        """Calcula ajustes específicos para cada pilar para manter a honestidade do breakdown."""
        core_types = ["AGENT", "CORE", "LOGIC", "UTIL"]
        
        # 1. Purity Penalty (Complexity Peaks > 15)
        peak_count = sum(1 for f, i in map_data.items() 
                         if i.get("complexity", 1) > 15 
                         and i.get("component_type") not in ["DOC", "INTERFACE", "TEST"])
        
        # 2. Stability Penalty (Missing Tests + Shallow Tests)
        shallow_count = 0
        if qa_data and isinstance(qa_data.get("matrix"), list):
            shallow_count = sum(1 for m in qa_data["matrix"] if m.get("test_status") == "SHALLOW" and (map_data.get(m.get("file"), {}).get("component_type") in core_types or (m.get("complexity", 1) > 1 and map_data.get(m.get("file"), {}).get("component_type") not in ["DOC", "INTERFACE", "TEST"])))

        # 3. Security Drain
        alerts = [r for r in all_alerts if isinstance(r, dict)]
        sev_map = {'critical': 15, 'high': 15, 'medium': 5, 'low': 1}
        sec_drain = sum(sev_map.get(r.get('severity'), 0) for r in alerts)
        
        # 4. Strategic (Roadmap) points
        strat_count = sum(1 for r in all_alerts if isinstance(r, str))

        return {
            "Purity (Complexity)": peak_count * 2.0,
            "Stability (Coverage)": shallow_count * 5.0,
            "Security (Vulnerabilities)": sec_drain,
            "Excellence (Documentation)": strat_count * 0.5
        }
