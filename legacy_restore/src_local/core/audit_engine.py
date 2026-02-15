import logging
import time
from src_local.core.task_orchestrator import TaskOrchestrator

logger = logging.getLogger(__name__)

class AuditEngine:
    """Motor especializado em auditorias estratégicas e scans de integridade."""
    
    def __init__(self, orchestrator):
        from pathlib import Path
        self.orc = orchestrator
        self.root = Path(orchestrator.project_root)
        self.task_orc = TaskOrchestrator(orchestrator)

    def run_strategic_audit(self, context, objective: str = None):
        start_t = time.time()
        target = objective or f"Validar integridade {list(context['identity'].get('stacks', {'Python'}))}"
        
        # Seleção e Detecção
        active = self.task_orc.select_active_phds(target, context['identity'].get('stacks', {'Python'}), self.orc.personas)
        c_files = self._detect_changes(context.get("map", {}).keys())
        self.orc.last_detected_changes = list(c_files.keys())
        
        # Execução
        findings = self.task_orc.run_audit_cycle(active, target, c_files, context)
        return findings, start_t

    def _detect_changes(self, map_files):
        def check(p):
            h = self.orc.cache_manager.get_file_hash(self.root / p)
            return (p, h) if self.orc.cache_manager.is_changed(p, h) else None
        return {p: h for p, h in (self.orc.executor.run_parallel(check, map_files) or []) if p}

    def run_obfuscation_scan(self, context_map=None):
        import time
        from src_local.utils.logging_config import log_performance
        start_t = time.time()
        
        try:
            from src_local.agents.Support.obfuscation_hunter import ObfuscationHunter
            hunter, findings = ObfuscationHunter(), []
            t_map = context_map or self.orc.context_engine.map
            
            for path, data in t_map.items():
                if path.endswith(".py"):
                    findings.extend(self._scan_single_file(hunter, path, data))
            
            log_performance(logger, start_t, "🕵️ [AuditEngine] Obfuscation scan")
            return findings
        except Exception: return []

    def _scan_single_file(self, hunter, path, data):
        content = data.get("content") or self.orc.context_engine.analyst.read_project_file(self.root / path)
        if not content: return []
        return [{
            "file": path, "line": i["line"], "severity": "CRITICAL", 
            "context": "ObfuscationHunter", "issue": f"Ofuscação: '{i['keyword']}'", 
            "snippet": f"Reconstrução: {i['reconstruction']}"
        } for i in hunter.scan_file(str(path), content)]
