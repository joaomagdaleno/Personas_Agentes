import os
import logging
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from src.agents.director import DirectorPersona
from src.utils.context_engine import ContextEngine
from src.utils.cache_manager import CacheManager
from src.utils.stability_ledger import StabilityLedger
from src.utils.persona_loader import PersonaLoader

logger = logging.getLogger(__name__)

class Orchestrator:
    """
    Maestro PhD: Coordena a inteligência coletiva sem acumular complexidade.
    """
    
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.director = DirectorPersona(self.project_root)
        self.context_engine = ContextEngine(self.project_root)
        self.cache_manager = CacheManager(self.project_root)
        self.stability_ledger = StabilityLedger(self.project_root)
        
        self.personas = [] 
        self.job_queue = [] 
        self.metrics = {"files_scanned": 0, "health_score": 100, "start_time": time.time()}

    def add_persona(self, persona_instance):
        self.personas.append(persona_instance)

    def run_phd_audit(self):
        return self.run_strategic_audit()

    def run_strategic_audit(self, objective: str = None):
        """Mobiliza a elite e executa auditoria paralela."""
        context_result = self.context_engine.analyze_project()
        detected_stacks = context_result['identity'].get('stacks', {'Python'})
        if not objective: objective = f"Validar integridade {list(detected_stacks)}"

        # Delegação de Personas Inteligentes
        active_phds = self._select_active_phds(objective, detected_stacks)

        final_queue = []
        with ThreadPoolExecutor(max_workers=os.cpu_count() or 4) as executor:
            files = {p: self.project_root/p for p in context_result.get("map", {}).keys()}
            changed = {p: self.cache_manager.get_file_hash(f) for p, f in files.items() if self.cache_manager.is_changed(p, self.cache_manager.get_file_hash(f))}
            
            futures = {executor.submit(self._run_task, agent, objective, changed): agent for agent in active_phds}
            for future in as_completed(futures):
                try: 
                    res = future.result()
                    if res: final_queue.extend(res)
                except Exception as e: logger.error(f"Erro no PhD {futures[future].name}: {e}")

        # Injeção de Topologia e Memória
        final_queue.extend(self._get_topology_issues(context_result))
        self.stability_ledger.update(final_queue)
        
        self.job_queue = final_queue
        return final_queue

    def generate_full_diagnostic(self):
        """Protocolo Soberano: Mobilize, Audit, Heal, Report."""
        if not self.personas: PersonaLoader.mobilize_all(self.project_root, self)
        
        results = self.run_phd_audit()
        health = self.get_system_health_360()
        
        # Sincronização e Relatório
        self.cache_manager.save()
        report = self.director.format_360_report(health, results)
        self._trigger_reflexes(health)
        
        output = self.project_root / "auto_healing_mission.md"
        output.write_text(report, encoding="utf-8")
        return output

    def get_system_health_360(self):
        """Sintetiza a saúde sistêmica via motores especializados."""
        context = self.context_engine.analyze_project()
        map_data = context.get("map", {})
        
        return {
            "objective": context["identity"].get("core_mission"),
            "health_score": self.metrics.get("health_score", 0),
            "dark_matter": [f for f, i in map_data.items() if not i.get("has_test", True)],
            "blind_spots": [f for f, i in map_data.items() if i.get("silent_error", False)],
            "brittle_points": self._analyze_brittle_risk(map_data),
            "persona_maturity": self._get_persona_maturity(),
            "parity": self.context_engine.analyze_stack_parity(self.personas),
            "ledger": self.stability_ledger.ledger,
            "pyramid": self._get_qa_data()["pyramid"],
            "test_execution": self._get_qa_data()["execution"]
        }

    def _get_qa_data(self):
        testify = next((p for p in self.personas if p.name == "Testify"), None)
        return {
            "pyramid": testify.analyze_test_pyramid() if testify else {},
            "execution": testify.run_test_suite() if testify else {}
        }

    # --- MÉTODOS PRIVADOS DE SUPORTE (ORGANIZAÇÃO) ---

    def _select_active_phds(self, objective, stacks):
        from src.agents.base import BaseActivePersona
        is_crit = any(k in objective.lower() for k in ["segurança", "crítico", "vulnerabilidade"])
        return [p for p in self.personas if (p.stack in stacks or p.stack == "Universal") and (not is_crit or p.__class__._reason_about_objective != BaseActivePersona._reason_about_objective)]

    def _get_topology_issues(self, context):
        issues = []
        for rel_path, info in context.get("map", {}).items():
            if info.get("brittle"): issues.append({"file": rel_path, "issue": "Fragilidade Lógica", "severity": "HIGH", "context": "ContextEngine"})
            if info.get("silent_error"): issues.append({"file": rel_path, "issue": "Erro Silenciado", "severity": "HIGH", "context": "ContextEngine"})
        return issues

    def _analyze_brittle_risk(self, map_data):
        brittle = []
        for f, info in map_data.items():
            if info.get("brittle"):
                crit = self.context_engine.get_criticality_score(f)
                reocc = self.stability_ledger.get_file_data(f).get("occurrences", 0)
                brittle.append({"file": f, "criticality": crit, "reoccurrence": reocc, "risk_level": "EXTREME" if crit > 5 and reocc > 2 else "HIGH"})
        return brittle

    def _get_persona_maturity(self):
        from src.agents.base import BaseActivePersona
        return [{"name": p.name, "maturity": "PRÁTICA" if p.__class__._reason_about_objective != BaseActivePersona._reason_about_objective else "TEORIA"} for p in self.personas]

    def _trigger_reflexes(self, health):
        if health['blind_spots']:
            voyager = next((p for p in self.personas if p.name == "Voyager"), None)
            if voyager: voyager.perform_active_healing(health['blind_spots'])
        if health['brittle_points']:
            forge = next((p for p in self.personas if p.name == "Forge"), None)
            if forge: logger.warning("⚒️ [Forge] Sistema em Lockdown por fragilidade crítica.")

    def _run_task(self, agent, objective, changed):
        agent.set_context({"identity": self.context_engine.project_identity, "map": self.context_engine.map})
        res = []
        if changed: res.extend(agent.perform_audit())
        res.extend(agent.perform_strategic_audit(objective))
        return res