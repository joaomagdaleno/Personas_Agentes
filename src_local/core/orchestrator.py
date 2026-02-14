import logging
import time
from pathlib import Path
from src_local.agents.Python.Strategic.director import DirectorPersona
from src_local.utils.context_engine import ContextEngine
from src_local.utils.cache_manager import CacheManager
from src_local.utils.stability_ledger import StabilityLedger
from src_local.utils.dependency_auditor import DependencyAuditor

logger = logging.getLogger(__name__)

class Orchestrator:
    """Maestro PhD: Coordena a inteligência coletiva via delegação total."""
    
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self._init_engines()
        self._init_tools()
        
        self.personas, self.job_queue = [], [] 
        self.metrics = {"files_scanned": 0, "health_score": 100, "start_time": time.time(), "efficiency": {}}
        
        self.on_health_update = None
        self.on_findings_update = None

    def _init_engines(self):
        self.director = DirectorPersona(self.project_root)
        self.context_engine = ContextEngine(self.project_root)
        self.cache_manager = CacheManager(self.project_root)
        from src_local.utils.memory_engine import MemoryEngine
        from src_local.utils.resource_governor import ResourceGovernor
        self.memory_engine = MemoryEngine(self.project_root)
        self.stability_ledger = StabilityLedger(self.project_root)
        self.dependency_auditor = DependencyAuditor(self.project_root)
        self.resource_governor = ResourceGovernor()

    def _init_tools(self):
        from src_local.agents.Support.infrastructure_assembler import InfrastructureAssembler
        from src_local.core.audit_engine import AuditEngine
        from src_local.agents.Support.metrics_assembler import MetricsAssembler
        from src_local.agents.Support.security_sentinel_agent import SecuritySentinelAgent
        
        tools = InfrastructureAssembler.assemble_orchestrator_tools(self.project_root)
        self.synthesizer, self.strategist = tools["synthesizer"], tools["strategist"]
        self.executor, self.core_validator = tools["executor"], tools["validator"]
        self.refiner, self.healer = tools.get("refiner"), tools.get("healer")
        self.architect = tools.get("architect")
        self.doc_gen = tools.get("doc_gen")
        
        self.metrics_assembler = MetricsAssembler()
        self.audit_engine = AuditEngine(self)
        self.security_sentinel = SecuritySentinelAgent()

    def run_strategic_audit(self, context, objective: str = None, include_history: bool = True):
        fnds, start_t = self.audit_engine.run_strategic_audit(context, objective)
        self._sync_and_ledger(fnds, context, include_history)
        
        if self.on_findings_update: self.on_findings_update(fnds)
        self._log_performance(start_t, "Auditoria Estratégica")
        return self._build_audit_report_queue(fnds, include_history)

    def set_thinking_depth(self, deep: bool = False):
        """Ajusta a capacidade cognitiva de todas as ferramentas e agentes."""
        self.director.cognitive.set_thinking_depth(deep)
        if self.refiner:
            self.refiner.set_thinking_depth(deep)

    def generate_full_diagnostic(self, skip_tests=False):
        self.resource_governor.wait_if_needed()
        from src_local.core.diagnostic_pipeline import DiagnosticPipeline
        return DiagnosticPipeline(self).execute(skip_tests=skip_tests)

    def get_system_health_360(self, ctx, health, fnds=None):
        ctx["parity"] = self.context_engine.analyze_stack_parity(self.personas)
        ctx["efficiency"] = self.metrics.get("efficiency", {})
        m_orc = self.metrics_assembler.get_orchestration_metrics(self.metrics, fnds)
        qa = self.metrics_assembler.gather_qa_data(ctx.get("map", {}), health, self.personas)
        res = self.synthesizer.synthesize_360(ctx, m_orc, self.personas, self.stability_ledger, qa)
        if self.on_health_update: self.on_health_update(res)
        return res

    def _sync_and_ledger(self, fnds, context, include_history):
        fnds.extend(self.synthesizer.get_topology_issues(context))
        fnds.extend(self.dependency_auditor.check_submodule_status())
        # 🛡️ Scan de Segurança Integrado
        fnds.extend(self.security_sentinel.scan_project(self.project_root, context.get("map", {})))
        
        self.stability_ledger.update(fnds, context.get("map"))
        self.memory_engine.index_project(context.get("map", {}))
        self._update_cache(context.get("map", {}))

    def _update_cache(self, m_data):
        for p in m_data:
            h = self.cache_manager.get_file_hash(self.project_root / p)
            if h: self.cache_manager.update(p, h)
        self.cache_manager.save()

    def _run_obfuscation_scan(self, context_map=None):
        return self.audit_engine.run_obfuscation_scan(context_map)

    def _build_audit_report_queue(self, current, include_history):
        if not include_history: return current
        q = list(current)
        for f, d in self.stability_ledger.ledger.items():
            if d.get('status') == 'HEALED':
                q.append({"file": f, "issue": "Histórico Curado", "severity": "HEALED", "context": "Ledger"})
        self.job_queue = q
        return q

    def _log_performance(self, start_t, stage):
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_t, f"🎭 [Orchestrator] {stage}", level=logging.INFO)

    def run_auto_healing(self, findings: list) -> int:
        if not self.healer: return 0
        crit = [f for f in findings if isinstance(f, dict) and f.get("severity") in ["CRITICAL", "HIGH"]]
        if not crit: return 0
        healed = sum(1 for f in crit if self.healer.heal_finding(f))
        if healed > 0:
            self.stability_ledger.clear()
            self.cache_manager.save()
        return healed

    def add_persona(self, instance): self.personas.append(instance)
    def _run_targeted_verification(self, plan): return self.audit_engine.task_orc.run_targeted_verification(plan)
