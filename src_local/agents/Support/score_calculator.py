
class ScoreCalculator:
    """Calculadora de Métricas de Saúde (Desacoplamento de Complexidade)."""

    def calculate_final_score(self, map_data, all_alerts):
        total_files = len(map_data)
        if total_files == 0: return 0

        raw = (
            self._calc_stability(map_data, total_files) +
            self._calc_purity(map_data, total_files) +
            self._calc_observability(map_data, total_files) +
            self._calc_security(all_alerts) +
            self._calc_excellence(map_data, total_files)
        )
        return self._apply_penalties(raw, all_alerts, map_data, total_files)

    def _calc_stability(self, map_data, total):
        test_files = sum(1 for f, i in map_data.items() if i.get("has_test"))
        return (test_files / total) * 40

    def _calc_purity(self, map_data, total):
        avg_complexity = sum(i.get("complexity", 1) for i in map_data.values()) / total
        return max(0, 20 - (avg_complexity * 1.5))

    def _calc_observability(self, map_data, total):
        tel_count = sum(1 for f, i in map_data.items() if i.get("component_type") != "TEST" and (i.get("telemetry") or "telemetry" in str(i)))
        return (tel_count / max(1, total)) * 15

    def _calc_security(self, all_alerts):
        high = [r for r in all_alerts if isinstance(r, dict) and r.get('severity') in ['critical', 'high']]
        return max(0, 15 - (len(high) * 5))

    def _calc_excellence(self, map_data, total):
        kdoc = sum(1 for f, i in map_data.items() if i.get("purpose") != "UNKNOWN")
        return (kdoc / total) * 10

    def _apply_penalties(self, raw, all_alerts, map_data, total):
        # Filtro de Integridade: Achados validados não drenam a saúde
        real_finds = [a for a in all_alerts if isinstance(a, dict) and "[INTEGRIDADE VALIDADA]" not in str(a.get('issue', ''))]
        
        high = [r for r in real_finds if r.get('severity') in ['critical', 'high']]
        medium = [r for r in real_finds if r.get('severity') == 'medium']
        low = [r for r in real_finds if r.get('severity') in ['low', 'strategic']]
        strat = sum(1 for r in all_alerts if isinstance(r, str)) # Notas globais permanecem
        loss = sum(1 for f, i in map_data.items() if not i.get("has_test"))

        ceiling = 100
        if high: ceiling = 60
        elif medium: ceiling = 85
        elif low or strat > 0 or loss > 0: ceiling = 99

        drain = (len(high) * 15) + (len(medium) * 5) + (len(low) * 1) + (strat * 0.5)
        return max(0, int(min(raw, ceiling) - (drain * 0.2)))
