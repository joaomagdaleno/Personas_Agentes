import logging
import time
from pathlib import Path
import hashlib
import os

logger = logging.getLogger(__name__)

class DiagnosticPipeline:
    """Orquestra o fluxo de diagnóstico completo."""
    
    _is_running = False  # 🛡️ Recursion Guard Soberano

    def __init__(self, orchestrator):
        self.orc = orchestrator
        from src_local.utils.finding_deduplicator import FindingDeduplicator
        self.deduplicator = FindingDeduplicator()

    def execute(self, skip_tests=False):
        """Protocolo Soberano: Reset -> Discovery -> Verify -> Report."""
        if DiagnosticPipeline._is_running:
            logger.warning("⚠️ [RecursionGuard] Diagnóstico já em andamento.")
            return Path("recursion_prevented.md")

        DiagnosticPipeline._is_running = True
        try:
            start_time = time.time()
            logger.info("🎬 Iniciando Pipeline de Diagnóstico Soberano...")
            self._reset()
            
            ctx, findings = self._run_discovery()
            internal_health = self._run_validation(findings, skip_tests)
            
            # Dedupe & Report
            final_findings = self.deduplicator.deduplicate(findings)
            res = self._finalize(ctx, internal_health, final_findings)

            from src_local.utils.logging_config import log_performance
            log_performance(logger, start_time, "✅ Pipeline concluído", level=logging.INFO)
            return res
        finally:
            DiagnosticPipeline._is_running = False

    def _reset(self):
        self.orc.job_queue = []
        self.orc.metrics["all_findings"] = []
        if not self.orc.personas: 
            from src_local.utils.persona_loader import PersonaLoader
            PersonaLoader.mobilize_all(self.orc.project_root, self.orc)

    def _run_discovery(self):
        """Fase 1: Descoberta e Auditoria Estratégica."""
        ctx = self.orc.context_engine.analyze_project()
        findings = self.orc.run_strategic_audit(ctx, include_history=False)
        findings.extend(self.orc._run_obfuscation_scan())
        return ctx, findings

    def _run_validation(self, findings, skip_tests):
        """Fase 2: Validação e Testes."""
        map_plan = self.orc.strategist.plan_targeted_verification(findings)
        
        if findings:
            findings += self.orc._run_targeted_verification(map_plan)

        if skip_tests:
            logger.info("🧪 [FastPath] Ignorando verificação core (unit tests)...")
            return {"success": True, "pass_rate": 100, "total_run": 0, "failed": 0, "pyramid": {}, "execution": {"success": True}}
            
        changed_paths = getattr(self.orc, 'last_detected_changes', [])
        if not changed_paths:
            changed_paths = [f.get("file") for f in findings if isinstance(f, dict) and f.get("file")]
        
        return self.orc.core_validator.verify_core_health(self.orc.project_root, changed_files=changed_paths)

    def _finalize(self, ctx, health, findings):
        snapshot = self.orc.get_system_health_360(ctx, health, findings)
        self.orc.synthesizer.trigger_reflexes(snapshot, self.orc.personas, findings, self.orc.dependency_auditor)
        
        # 🧠 Cognitive Layer: Análise de Erros Críticos (Top 3)
        if hasattr(self.orc, 'refiner') and self.orc.refiner:
            criticals = [f for f in findings if isinstance(f, dict) and f.get('severity') == 'CRITICAL'][:3]
            if criticals:
                logger.info(f"🧠 [Cognitive] Analisando {len(criticals)} erros críticos com IA...")
                for flaw in criticals:
                    if 'issue' in flaw and 'file' in flaw:
                        insight = self.orc.refiner.analyze_failure(flaw['file'], flaw['issue'])
                        if insight:
                            flaw['ai_insight'] = insight

        self.orc.cache_manager.save()
        
        # 🛡️ Test Isolation Guard: Impede que testes sobrescrevam o relatório real
        if os.environ.get("DIAGNOSTIC_TEST_MODE") == "1":
            logger.info("🛡️ [TestPath] Suprimindo escrita de relatório em modo de teste.")
            return Path("test_report_suppressed.md")

        report = self.orc.director.format_360_report(snapshot, findings)
        
        docs_dir = self.orc.project_root / "docs"
        docs_dir.mkdir(parents=True, exist_ok=True)
        report_file = docs_dir / "auto_healing_VERIFIED.md"
        report_file.write_text(report, encoding="utf-8")
        return report_file
