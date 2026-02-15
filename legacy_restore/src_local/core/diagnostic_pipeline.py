"""
🚀 Pipeline de Diagnóstico Sistêmico.
Orquestrador PhD responsável pela sincronia absoluta das fases de auditoria.
"""
import logging
import time
from pathlib import Path
from src_local.utils.finding_deduplicator import FindingDeduplicator
from src_local.agents.Support.discovery_agent import DiscoveryAgent
from src_local.agents.Support.validation_agent import ValidationAgent
from src_local.core.diagnostic_finalizer import DiagnosticFinalizer

logger = logging.getLogger(__name__)

class DiagnosticPipeline:
    """Maestro soberano que coordena Descoberta, Validação e Relatório."""
    
    _is_running = False

    def __init__(self, orchestrator):
        self.orc = orchestrator
        self.deduplicator = FindingDeduplicator()

    def execute(self, skip_tests=False):
        """Fluxo de execução soberano com proteção de concorrência."""
        if DiagnosticPipeline._is_running: return Path("recursion_prevented.md")
        
        DiagnosticPipeline._is_running = True
        try:
            return self._run_atomic_pipeline(skip_tests)
        finally:
            DiagnosticPipeline._is_running = False

    def _run_atomic_pipeline(self, skip):
        """Execução linear das fases delegadas."""
        start_t = time.time()
        self._reset()
        
        ctx, fnds = DiscoveryAgent(self.orc).run_discovery_phase()
        health = ValidationAgent(self.orc).run_validation_phase(fnds, skip)
        
        result = DiagnosticFinalizer.finalize(self, ctx, health, self.deduplicator.deduplicate(fnds))
        
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_t, "✅ [Pipeline] Diagnóstico")
        return result

    def _reset(self):
        """Limpa o estado para nova rodada."""
        self.orc.job_queue, self.orc.metrics["all_findings"] = [], []
        if not self.orc.personas: 
            from src_local.utils.persona_loader import PersonaLoader
            PersonaLoader.mobilize_all(self.orc.project_root, self.orc)
