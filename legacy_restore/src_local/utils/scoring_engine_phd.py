import logging

logger = logging.getLogger(__name__)

class ScoringEnginePhd:
    """🧬 Motor de Scoring PhD: Cálculo matemático de sinais vitais."""
    
    @staticmethod
    def calculate(map_data, all_alerts, total_files):
        if total_files == 0: return 0
        
        # Dimensões
        stability = ScoringEnginePhd._stability(map_data, total_files)
        purity = ScoringEnginePhd._purity(map_data, total_files)
        obs = ScoringEnginePhd._obs(map_data, total_files)
        security = ScoringEnginePhd._security(all_alerts)
        excel = ScoringEnginePhd._excellence(map_data, total_files)

        raw = stability + purity + obs + security + excel
        return ScoringEnginePhd._apply_constraints(raw, all_alerts, stability, total_files)

    @staticmethod
    def _stability(map_data, total):
        test_files = [f for f, i in map_data.items() if i.get("has_test")]
        return (len(test_files) / total) * 40

    @staticmethod
    def _purity(map_data, total):
        avg = sum(i.get("complexity", 1) for i in map_data.values()) / total
        return max(0, 20 - ((avg - 1) * 1.5))

    @staticmethod
    def _obs(map_data, total):
        # Diferencia entre ter telemetria real e apenas mencionar a palavra em strings
        with_tel = sum(1 for f, i in map_data.items() 
            if i.get("component_type") != "TEST" and i.get("telemetry"))
        return (with_tel / max(1, total)) * 15

    @staticmethod
    def _security(alerts):
        high = [r for r in alerts if isinstance(r, dict) and r.get('severity') in ['critical', 'high']]
        return max(0, 15 - (len(high) * 5))

    @staticmethod
    def _excellence(map_data, total):
        kdoc = sum(1 for f, i in map_data.items() if i.get("purpose") != "UNKNOWN")
        return (kdoc / total) * 10

    @staticmethod
    def _apply_constraints(raw, alerts, stability_score, total):
        high = [r for r in alerts if isinstance(r, dict) and r.get('severity') in ['critical', 'high']]
        med = [r for r in alerts if isinstance(r, dict) and r.get('severity') == 'medium']
        low = [r for r in alerts if isinstance(r, dict) and r.get('severity') in ['low', 'strategic']]
        strat = sum(1 for r in alerts if isinstance(r, str))

        ceiling = 100
        if high: ceiling = 60
        elif med: ceiling = 85
        elif low or strat > 0 or (stability_score / 40 * total) < total: ceiling = 99

        drain = (len(high) * 15) + (len(med) * 5) + (len(low) * 1) + (strat * 0.5)
        return max(0, int(min(raw, ceiling) - (drain * 0.2)))
