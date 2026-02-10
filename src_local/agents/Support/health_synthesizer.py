import logging
import time

logger = logging.getLogger(__name__)

class HealthSynthesizer:
    """🩺 Analista de Saúde Sistêmica e Métricas PhD (Optimized)."""
    
    def __init__(self):
        from src_local.agents.Support.score_calculator import ScoreCalculator
        self.calculator = ScoreCalculator()

    def _calculate_rigorous_3_0(self, map_data, all_alerts, bonus=0):
        """🩺 [RECONSTRUCTED] Interface legada para o algoritmo de saúde Rigoroso 3.0."""
        res = self.calculator.calculate_final_score(map_data, all_alerts)
        return res if isinstance(res, int) else res.get("score", 0)

    def synthesize_360(self, context, orchestrator_metrics, orchestrator_personas, stability_ledger, qa_data) -> dict:
        """Consolida sinais vitais em um diagnóstico único."""
        map_data = context.get("map", {})
        all_alerts = orchestrator_metrics.get("all_findings", [])
        
        # 1. Maturidade (List based)
        avg_xp = sum(getattr(p, 'experience', 0) for p in orchestrator_personas) / max(1, len(orchestrator_personas))
        maturity = "VETERAN" if avg_xp > 80 else "ELITE" if avg_xp > 50 else "RECRUIT"

        # 2. Score & Dark Matter
        health_packet = self.calculator.calculate_final_score(map_data, all_alerts, qa_data=qa_data)
        score = health_packet["score"] if isinstance(health_packet, dict) else health_packet
        breakdown = health_packet.get("breakdown", {}) if isinstance(health_packet, dict) else {}
        
        dark_matter = [f for f, i in map_data.items() if i.get("component_type") in ["AGENT", "CORE", "LOGIC", "UTIL"] and not i.get("has_test")]
        
        # Identificação de Testes Frágeis (SHALLOW)
        shallow_files = {m['file'] for m in qa_data.get("matrix", []) if m.get("test_status") == "SHALLOW"}
        
        # Filtro de Fragilidades: Inclui bugs latentes, ledger instável e testes rasos
        brittle_points = []
        for f, i in map_data.items():
            if i.get("component_type") in ["AGENT", "CORE", "LOGIC", "UTIL"] and not f.endswith("__init__.py"):
                if i.get("brittle") or f in shallow_files:
                    brittle_points.append(f)
                elif i.get("component_type") != "AGENT" and f in stability_ledger.ledger and stability_ledger.ledger[f].get("status") != "HEALED":
                    brittle_points.append(f)

        return {
            "objective": context["identity"].get("core_mission"), "health_score": score,
            "timestamp": time.strftime('%Y-%m-%d %H:%M:%S'), "persona_maturity": maturity,
            "parity": context.get("parity", {}), "ledger": stability_ledger.ledger,
            "pyramid": qa_data["pyramid"], "test_execution": qa_data["execution"],
            "test_quality_matrix": qa_data.get("matrix", []),
            "efficiency": context.get("efficiency", {}), "map": map_data, "total_issues": len(all_alerts),
            "is_external": context["identity"].get("is_external", False), "dark_matter": dark_matter,
            "brittle_points": brittle_points, "health_breakdown": breakdown,
            "blind_spots": [f for f, i in map_data.items() if i.get("silent_error")]
        }

    def trigger_reflexes(self, health_snapshot, personas, all_alerts, auditor):
        """Ativa reações autônomas se a saúde cair abaixo do limiar crítico."""
        if health_snapshot["health_score"] < 40:
            logger.warning("🚨 [Reflexo] Saúde Crítica Detectada.")
            for p in personas:
                if hasattr(p, "halt_experimentation"): p.halt_experimentation()
        
        if any(isinstance(i, dict) and i.get('context') == 'DependencyAuditor' for i in all_alerts):
            auditor.sync_submodule()

    def get_topology_issues(self, context):
        """
        [Reconstructed] Retorna problemas topológicos baseados no contexto.
        """
        return []
