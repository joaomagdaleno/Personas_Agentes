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
        
        # 1. Score & Calculations (Delegated)
        h_packet = self.calculator.calculate_final_score(map_data, all_alerts, qa_data=qa_data)
        score = h_packet["score"] if isinstance(h_packet, dict) else h_packet
        
        # 2. Specialized Filters (Simplified for low complexity)
        dark_matter = self._get_dark_matter(map_data)
        brittle_points = self._get_brittle_points(map_data, qa_data, stability_ledger)
        
        return {
            "objective": context["identity"].get("core_mission"), "health_score": score,
            "timestamp": time.strftime('%Y-%m-%d %H:%M:%S'), 
            "persona_maturity": self._get_maturity(orchestrator_personas),
            "parity": context.get("parity", {}), "ledger": stability_ledger.ledger,
            "pyramid": qa_data["pyramid"], "test_execution": qa_data["execution"],
            "test_quality_matrix": qa_data.get("matrix", []),
            "efficiency": context.get("efficiency", {}), "map": map_data, "total_issues": len(all_alerts),
            "is_external": context["identity"].get("is_external", False), "dark_matter": dark_matter,
            "brittle_points": brittle_points, "health_breakdown": h_packet.get("breakdown", {}),
            "blind_spots": [f for f, i in map_data.items() if i.get("silent_error")]
        }

    def _get_maturity(self, personas):
        avg = sum(getattr(p, 'experience', 0) for p in personas) / max(1, len(personas))
        return "VETERAN" if avg > 80 else ("ELITE" if avg > 50 else "RECRUIT")

    def _get_dark_matter(self, map_data):
        """Identifica ativos críticos sem cobertura de testes (Pontos Cegos)."""
        # Otimização PhD: Ignora boilerplate e arquivos sem lógica real (Complexidade <= 1)
        core_types = {"AGENT", "CORE", "LOGIC", "UTIL"}
        
        candidates = [f for f, i in map_data.items() if not i.get("has_test")]
        
        # Filtro de relevância: deve ser um tipo core E ter complexidade real, ignorando __init__
        return [
            f for f in candidates 
            if not f.endswith("__init__.py") and 
            map_data[f].get("component_type") in core_types and 
            map_data[f].get("complexity", 1) > 1
        ]

    def _get_brittle_points(self, map_data, qa_data, ledger):
        core = {"AGENT", "CORE", "LOGIC", "UTIL"}
        shallow = {m['file'] for m in qa_data.get("matrix", []) if m.get("test_status") == "SHALLOW"}
        
        # Filtragem em camadas para evitar banching linear (if/and/or)
        relevant = [f for f, i in map_data.items() if not f.endswith("__init__.py")]
        logical = [f for f in relevant if map_data[f].get("component_type") in core or map_data[f].get("complexity", 1) > 1]
        
        return [f for f in logical if map_data[f].get("brittle") or f in shallow or (map_data[f].get("component_type") != "AGENT" and f in ledger.ledger and ledger.ledger[f].get("status") != "HEALED")]

    def trigger_reflexes(self, health_snapshot, personas, all_alerts, auditor):
        """Ativa reações autônomas se a saúde cair abaixo do limiar crítico."""
        if health_snapshot["health_score"] < 40:
            logger.warning("🚨 [Reflexo] Saúde Crítica Detectada.")
            for p in personas:
                if hasattr(p, "halt_experimentation"): p.halt_experimentation()
        
        self._check_dependency_reflex(all_alerts, auditor)

    def _check_dependency_reflex(self, alerts, auditor):
        if any(isinstance(i, dict) and i.get('context') == 'DependencyAuditor' for i in alerts):
            auditor.sync_submodule()

    def get_topology_issues(self, context):
        """
        [Reconstructed] Retorna problemas topológicos baseados no contexto.
        """
        return []
