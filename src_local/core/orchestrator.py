import logging
import time
from pathlib import Path
from src_local.agents.director import DirectorPersona
from src_local.utils.context_engine import ContextEngine
from src_local.utils.cache_manager import CacheManager
from src_local.utils.stability_ledger import StabilityLedger
from src_local.utils.persona_loader import PersonaLoader
from src_local.utils.dependency_auditor import DependencyAuditor

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
        from src_local.agents.Support.infrastructure_assembler import InfrastructureAssembler
        from src_local.core.task_orchestrator import TaskOrchestrator
        tools = InfrastructureAssembler.assemble_orchestrator_tools(self.project_root)
        
        self.synthesizer, self.strategist = tools["synthesizer"], tools["strategist"]
        self.executor, self.core_validator = tools["executor"], tools["validator"]
        from src_local.agents.Support.metrics_assembler import MetricsAssembler
        self.metrics_assembler = MetricsAssembler()
        self.task_orc = TaskOrchestrator(self)
        
        self.personas, self.job_queue = [], [] 
        self.metrics = {"files_scanned": 0, "health_score": 100, "start_time": time.time(), "efficiency": {}}

    def add_persona(self, persona_instance):
        self.personas.append(persona_instance)

    def run_strategic_audit(self, context, objective: str = None, include_history: bool = True):
        """🚀 Mobiliza a elite e executa auditoria paralela delegada."""
        start_time = time.time()
        
        target_obj = objective or self._generate_default_objective(context)
        active_phds = self._select_active_phds(target_obj, context['identity'].get('stacks', {'Python'}))
        changed_files = self._detect_changed_files(context.get("map", {}).keys())
        
        findings = self.task_orc.run_audit_cycle(active_phds, target_obj, changed_files, context)
        self._sync_and_ledger(findings, context, include_history)
        
        self._log_orchestration_performance(start_time, "Auditoria Estratégica")
        return self._build_audit_report_queue(findings, include_history)

    def _generate_default_objective(self, context):
        stacks = context['identity'].get('stacks', {'Python'})
        return f"Validar integridade {list(stacks)}"

    def _sync_and_ledger(self, findings, context, include_history):
        self._inject_topology_and_git_issues(findings, context)
        self.stability_ledger.update(findings, context.get("map"))

    def _inject_topology_and_git_issues(self, findings, context):
        """Delega a injeção de problemas de infraestrutura."""
        findings.extend(self.synthesizer.get_topology_issues(context))
        findings.extend(self.dependency_auditor.check_submodule_status())

    def generate_full_diagnostic(self):
        """Portal de diagnóstico com telemetria de performance."""
        start_time = time.time()
        from src_local.core.diagnostic_pipeline import DiagnosticPipeline
        res = DiagnosticPipeline(self).execute()
        for info in self.context_engine.map.values():
            if "content" in info: del info["content"]
        
        self._log_orchestration_performance(start_time, "Diagnóstico 360")
        return res

    def get_system_health_360(self, context, internal_health, all_findings=None):
        """Sintetiza a saúde sistêmica via delegação."""
        map_data = context.get("map", {})
        context["parity"] = self.context_engine.analyze_stack_parity(self.personas)
        context["efficiency"] = self.metrics.get("efficiency", {})
        
        metrics = self.metrics_assembler.get_orchestration_metrics(self.metrics, all_findings)
        qa_data = self.metrics_assembler.gather_qa_data(map_data, internal_health, self.personas)
        
        return self.synthesizer.synthesize_360(context, metrics, self.personas, self.stability_ledger, qa_data)

    def _select_active_phds(self, objective, stacks):
        return self.task_orc.select_active_phds(objective, stacks, self.personas)

    def _run_targeted_verification(self, audit_map):
        return self.task_orc.run_targeted_verification(audit_map)

    def _detect_changed_files(self, map_files):
        def check_file(p):
            f_hash = self.cache_manager.get_file_hash(self.project_root / p)
            return (p, f_hash) if self.cache_manager.is_changed(p, f_hash) else None
        return {p: h for p, h in (self.executor.run_parallel(check_file, map_files) or []) if p}

    def _build_audit_report_queue(self, current, include_history):
        if not include_history: return current
        q = list(current)
        for f, d in self.stability_ledger.ledger.items():
            if d.get('status') == 'HEALED':
                q.append({"file": f, "issue": "Histórico Curado", "severity": "HEALED", "context": "Ledger"})
        self.job_queue = q
        return q

    def _run_obfuscation_scan(self, context_map=None):
        try:
            from src_local.agents.Support.obfuscation_hunter import ObfuscationHunter
            hunter, findings = ObfuscationHunter(), []
            t_map = context_map or self.context_engine.map
            for rel_path, data in t_map.items():
                if rel_path.endswith(".py"):
                    content = data.get("content") or self.context_engine.analyst.read_project_file(self.project_root / rel_path)
                    if content: findings.extend(self._get_obfuscation_findings(hunter, rel_path, content))
            return findings
        except (ImportError, Exception) as e:
            logger.error(f"🚨 Falha no escaneamento de ofuscação: {e}")
            return []

    def _get_obfuscation_findings(self, hunter, rel_path, content):
        res = []
        for i in hunter.scan_file(str(rel_path), content):
            res.append({"file": rel_path, "line": i["line"], "severity": "CRITICAL", "context": "ObfuscationHunter",
                        "issue": f"Ofuscação: '{i['keyword']}'", "snippet": f"Reconstrução: {i['reconstruction']}"})
        return res

    def _log_orchestration_performance(self, start_time, stage):
        """Telemetria centralizada para o orquestrador."""
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_time, f"🎭 [Orchestrator] {stage}", level=logging.INFO)