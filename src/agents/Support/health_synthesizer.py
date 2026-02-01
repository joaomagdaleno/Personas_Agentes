import logging

logger = logging.getLogger(__name__)

class HealthSynthesizer:
    """Assistente Técnico: Analista de Saúde Sistêmica e Métricas PhD 🩺"""
    
    def synthesize_360(self, context, orchestrator_metrics, orchestrator_personas, stability_ledger, qa_data) -> dict:
        """Consolida todos os sinais vitais do sistema em um diagnóstico único."""
        map_data = context.get("map", {})
        
        return {
            "objective": context["identity"].get("core_mission"),
            "health_score": orchestrator_metrics.get("health_score", 0),
            "dark_matter": self._find_dark_matter(map_data),
            "blind_spots": self._find_blind_spots(map_data),
            "brittle_points": self._analyze_brittle_risk(map_data, stability_ledger),
            "persona_maturity": self._get_persona_maturity(orchestrator_personas),
            "parity": context["parity"] if "parity" in context else {}, # Injetado pelo motor
            "ledger": stability_ledger.ledger,
            "pyramid": qa_data["pyramid"],
            "test_execution": qa_data["execution"],
            "test_quality_matrix": self._get_test_quality_matrix(orchestrator_personas, map_data),
            "efficiency": context.get("efficiency", {}), # Nova métrica
            "map": map_data 
        }

    def _find_dark_matter(self, map_data):
        return [f for f, i in map_data.items() if not i.get("has_test", True)]

    def _find_blind_spots(self, map_data):
        return [f for f, i in map_data.items() if i.get("silent_error", False)]

    def _analyze_brittle_risk(self, map_data, stability_ledger):
        brittle = []
        for f, info in map_data.items():
            if info.get("brittle"):
                reocc = stability_ledger.get_file_data(f).get("occurrences", 0)
                # Score de criticidade simplificado para o suporte
                crit = 10 if "core" in f or "base" in f else 1
                brittle.append({
                    "file": f, "criticality": crit, "reoccurrence": reocc, 
                    "risk_level": "EXTREME" if crit > 5 and reocc > 2 else "HIGH"
                })
        return sorted(brittle, key=lambda x: x['criticality'], reverse=True)

    def _get_persona_maturity(self, personas):
        from src.agents.base import BaseActivePersona
        return [{"name": p.name, "maturity": "PRÁTICA" if p.__class__._reason_about_objective != BaseActivePersona._reason_about_objective else "TEORIA"} for p in personas]

    def _get_test_quality_matrix(self, personas, map_data):
        testify = next((p for p in personas if p.name == "Testify"), None)
        return testify.analyze_test_quality_matrix(map_data) if testify else []

    def trigger_reflexes(self, health, personas, job_queue, auditor):
        """Ativa respostas automáticas baseadas no estado de saúde."""
        if health['blind_spots']:
            v = next((p for p in personas if p.name == "Voyager"), None)
            if v: v.perform_active_healing(health['blind_spots'])
        
        if any(isinstance(i, dict) and i.get('context') == 'DependencyAuditor' for i in job_queue):
            auditor.sync_submodule()
            
        if health['brittle_points']:
            f = next((p for p in personas if p.name == "Forge"), None)
            if f: logger.warning("⚒️ [Forge] Fragilidade detectada!")

    def get_topology_issues(self, context):
        """Mapeia problemas de saúde estrutural detectados pelo motor."""
        issues = []
        for rel_path, info in context.get("map", {}).items():
            if info.get("brittle"):
                issues.append({"file": rel_path, "issue": "Fragilidade Lógica", "severity": "HIGH", "context": "ContextEngine"})
            if info.get("silent_error"):
                issues.append({"file": rel_path, "issue": "Erro Silenciado", "severity": "HIGH", "context": "ContextEngine"})
        return issues
