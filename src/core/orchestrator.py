import logging
import time
from pathlib import Path
from src.agents.director import DirectorPersona
from src.utils.context_engine import ContextEngine
from src.utils.cache_manager import CacheManager
from src.utils.stability_ledger import StabilityLedger
from src.utils.persona_loader import PersonaLoader
from src.utils.dependency_auditor import DependencyAuditor

logger = logging.getLogger(__name__)

class Orchestrator:
    """Maestro PhD: Coordena a inteligência coletiva via delegação total."""
    
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.director = DirectorPersona(self.project_root)
        self.context_engine = ContextEngine(self.project_root)
        self.cache_manager = CacheManager(self.project_root)
        self.stability_ledger = StabilityLedger(self.project_root)
        self.dependency_auditor = DependencyAuditor(self.project_root)
        
        # Injeção via Assembler
        from src.agents.Support.infrastructure_assembler import InfrastructureAssembler
        tools = InfrastructureAssembler.assemble_orchestrator_tools(self.project_root)
        
        self.synthesizer = tools["synthesizer"]
        self.strategist = tools["strategist"]
        self.executor = tools["executor"]
        self.core_validator = tools["validator"]
        
        self.personas, self.job_queue = [], [] 
        self.metrics = {"files_scanned": 0, "health_score": 100, "start_time": time.time(), "efficiency": {}}

    def add_persona(self, persona_instance):
        self.personas.append(persona_instance)

    def run_strategic_audit(self, context, objective: str = None, include_history: bool = True):
        """Mobiliza a elite e executa auditoria paralela delegada."""
        stacks = context['identity'].get('stacks', {'Python'})
        obj = objective or f"Validar integridade {list(stacks)}"

        active_phds = self._select_active_phds(obj, stacks)
        changed_files = self._detect_changed_files(context.get("map", {}).keys())
        
        def audit_task(agent): return self._run_task(agent, obj, changed_files)
        findings = self.executor.run_parallel(audit_task, active_phds)

        # Agregação de inteligência periférica
        findings.extend(self.synthesizer.get_topology_issues(context))
        findings.extend(self.dependency_auditor.check_submodule_status())
        
        self.stability_ledger.update(findings, context.get("map"))
        return self._build_audit_report_queue(findings, include_history)

    def generate_full_diagnostic(self):
        """Protocolo Soberano Inteligente: Discovery -> Targeted Verification."""
        if not self.personas: PersonaLoader.mobilize_all(self.project_root, self)
        
        context_v1 = self.context_engine.analyze_project()
        initial_findings = self.run_strategic_audit(context_v1, include_history=False)
        
        audit_map = self.strategist.plan_targeted_verification(initial_findings)
        self.metrics["efficiency"] = self.strategist.calculate_efficiency(len(context_v1["map"]), len(audit_map))
        
        # DELEGAÇÃO: Ativação de Reflexos
        self.synthesizer.trigger_reflexes(
            self.get_system_health_360(context_v1, {"success": True}),
            self.personas, self.job_queue, self.dependency_auditor
        )
        
        post_findings = self._run_targeted_verification(audit_map) if initial_findings else []
        
        # Consolida TODOS os achados sem limite de amostragem para o relatório exemplar
        all_findings = initial_findings + post_findings
        
        self.cache_manager.save()
        health = self.get_system_health_360(context_v1, self.core_validator.verify_core_health(self.project_root))
        report = self.director.format_360_report(health, all_findings)
        
        (self.project_root / "auto_healing_mission.md").write_text(report, encoding="utf-8")
        return self.project_root / "auto_healing_mission.md"

    def get_system_health_360(self, context, internal_health):
        """Sintetiza a saúde sistêmica via delegação."""
        map_data = context.get("map", {})
        context["parity"] = self.context_engine.analyze_stack_parity(self.personas)
        qa_data = {"pyramid": self._get_target_test_pyramid(map_data), "execution": internal_health}
        context["efficiency"] = self.metrics.get("efficiency", {})
        return self.synthesizer.synthesize_360(context, self.metrics, self.personas, self.stability_ledger, qa_data)

    def _get_target_test_pyramid(self, map_data):
        testify = next((p for p in self.personas if p.name == "Testify"), None)
        return testify.analyze_test_pyramid(map_data) if testify else {}

    def _detect_changed_files(self, map_files):
        def check_file(p):
            f_hash = self.cache_manager.get_file_hash(self.project_root / p)
            return (p, f_hash) if self.cache_manager.is_changed(p, f_hash) else None
        changed_list = self.executor.run_parallel(check_file, map_files)
        return {p: h for p, h in (changed_list if changed_list else [])}

    def _run_targeted_verification(self, audit_map):
        verified_findings = []
        for file, agents in audit_map.items():
            full_path = self.project_root / file
            if not full_path.exists(): continue
            content = self.context_engine.analyst.read_project_file(full_path)
            if not content: continue
            for agent_name in agents:
                agent = next((p for p in self.personas if p.name == agent_name), None)
                if agent: verified_findings.extend(agent.perform_strategic_audit(file_target=file, content_target=content))
        return verified_findings

    def _select_active_phds(self, objective, stacks):
        from src.agents.base import BaseActivePersona
        is_crit = any(k in objective.lower() for k in ["segurança", "crítico", "vulnerabilidade"])
        return [p for p in self.personas if (p.stack in stacks or p.stack == "Universal") and (not is_crit or p.__class__._reason_about_objective != BaseActivePersona._reason_about_objective)]

    def _build_audit_report_queue(self, current, include_history):
        if not include_history: return current
        final_queue = list(current)
        for file, data in self.stability_ledger.ledger.items():
            if data.get('status') == 'HEALED':
                final_queue.append({"file": file, "issue": "Histórico de Falha Curada", "severity": "HEALED", "context": "Ledger"})
        self.job_queue = final_queue
        return final_queue

    def _run_task(self, agent, objective, changed):
        agent.set_context({"identity": self.context_engine.project_identity, "map": self.context_engine.map})
        res = []
        if changed: res.extend(agent.perform_audit())
        res.extend(agent.perform_strategic_audit(objective))
        return res
