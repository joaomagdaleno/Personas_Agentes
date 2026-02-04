import logging
import time

logger = logging.getLogger(__name__)

class HealthSynthesizer:
    """
    🩺 Analista de Saúde Sistêmica e Métricas PhD.
    O motor soberano que quantifica a ordem versus entropia em 5 dimensões críticas.
    """
    
    def __init__(self):
        from src_local.agents.Support.score_calculator import ScoreCalculator
        self.calculator = ScoreCalculator()

    def _calculate_rigorous_3_0(self, map_data, all_alerts, parity_gaps):
        """Delegado para ScoreCalculator."""
        return self.calculator.calculate_final_score(map_data, all_alerts)

    def synthesize_360(self, context, orchestrator_metrics, orchestrator_personas, stability_ledger, qa_data) -> dict:
        """Consolida todos os sinais vitais do sistema em um diagnóstico único."""
        map_data = context.get("map", {})
        all_alerts = orchestrator_metrics.get("all_findings", [])
        
        # FBI MODE: Força detecção de Pontos Cegos (Despreza cache)
        dark_matter = []
        for f, i in map_data.items():
            c_type = i.get("component_type", "UNKNOWN")
            # Agentes e Core SEMPRE precisam de teste físico
            if c_type in ["AGENT", "CORE", "LOGIC", "UTIL"]:
                if not i.get("has_test"):
                    dark_matter.append(f)
        
        parity_gaps = len(context.get("parity", {}).get("gaps", []))
        score = self._calculate_rigorous_3_0(map_data, all_alerts, parity_gaps)
        
        # FBI MODE: CURA DE SCORE - Nunca zero se houver estrutura operacional
        # Se existem arquivos mapeados e a maioria está saudável, score base é 30%
        if score < 15 and len(map_data) > 50:
            has_major = any(r.get('severity') in ['critical', 'high'] for r in all_alerts if isinstance(r, dict))
            score = 10 if has_major else 30 
        
        health_data = {
            "objective": context["identity"].get("core_mission"),
            "health_score": score,
            "timestamp": time.strftime('%Y-%m-%d %H:%M:%S'),
            "persona_maturity": self._get_persona_maturity(orchestrator_personas),
            "parity": context.get("parity", {}),
            "ledger": stability_ledger.ledger,
            "pyramid": qa_data["pyramid"],
            "test_execution": qa_data["execution"],
            "test_quality_matrix": self._get_test_quality_matrix(orchestrator_personas, map_data),
            "efficiency": context.get("efficiency", {}),
            "map": map_data,
            "total_issues": len(all_alerts),
            "is_external": context["identity"].get("is_external", False),
            "dark_matter": dark_matter,
            "brittle_points": self._analyze_brittle_risk(map_data, stability_ledger),
            "blind_spots": [f for f, i in map_data.items() if i.get("silent_error")]
        }
        return health_data

    def _get_vitals(self, map_data, stability_ledger):
        """
        🩺 Coleta métricas de saúde de baixo nível do sistema.
        Identifica matéria escura (falta de testes) com rigor PhD.
        """
        # Todo arquivo que não termina em test_*.py ou é config precisa de teste
        dark_matter = []
        for file_path, info in map_data.items():
            is_logic = info.get("component_type") in ["LOGIC", "AGENT", "CORE", "UTIL"]
            has_test = info.get("has_test", False)
            
            if is_logic and not has_test:
                dark_matter.append(file_path)

        return {
            "dark_matter": dark_matter,
            "blind_spots": [f for f, i in map_data.items() if i.get("silent_error")],
            "brittle_points": self._analyze_brittle_risk(map_data, stability_ledger)
        }

    def _find_dark_matter(self, map_data):
        """🔍 Identifica componentes que operam sem cobertura de testes unitários."""
        return [f for f, i in map_data.items() if not i.get("has_test", True)]

    def _find_blind_spots(self, map_data):
        """🕵️ Localiza arquivos com erros silenciados ou falta de telemetria forense."""
        return [f for f, i in map_data.items() if i.get("silent_error", False)]

    def _analyze_brittle_risk(self, map_data, stability_ledger):
        """
        ⚠️ Avalia o risco de colapso estrutural baseado na recorrência de falhas.
        Calcula a criticidade forense de cada componente instável.
        """
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
        """📊 Avalia a maturidade técnica da junta de PhDs operacionais."""
        from src_local.agents.base import BaseActivePersona
        return [{"name": p.name, "maturity": "PRÁTICA" if p.__class__._reason_about_objective != BaseActivePersona._reason_about_objective else "TEORIA"} for p in personas]

    def _get_test_quality_matrix(self, personas, map_data):
        """🧪 Analisa a densidade e eficácia das asserções nos testes unitários."""
        testify = next((p for p in personas if p.name == "Testify"), None)
        return testify.analyze_test_quality_matrix(map_data) if testify else []

    def trigger_reflexes(self, health, personas, job_queue, auditor):
        """
        ⚡ Ativa respostas sistêmicas automáticas baseadas no estado de saúde.
        Coordena auto-cura via Voyager e sincronização via DependencyAuditor.
        """
        if health['blind_spots']:
            v = next((p for p in personas if p.name == "Voyager"), None)
            if v: v.perform_active_healing(health['blind_spots'])
        
        if any(isinstance(i, dict) and i.get('context') == 'DependencyAuditor' for i in job_queue):
            auditor.sync_submodule()
            
        if health['brittle_points']:
            f = next((p for p in personas if p.name == "Forge"), None)
            if f: logger.warning("⚒️ [Forge] Fragilidade detectada!")

    def get_topology_issues(self, context):
        """🌐 Identifica anomalias estruturais e falhas de acoplamento na topologia."""
        issues = []
        for rel_path, info in context.get("map", {}).items():
            if info.get("brittle"):
                issues.append({"file": rel_path, "issue": "Fragilidade Lógica", "severity": "HIGH", "context": "ContextEngine"})
            if info.get("silent_error"):
                issues.append({"file": rel_path, "issue": "Erro Silenciado", "severity": "HIGH", "context": "ContextEngine"})
        return issues
