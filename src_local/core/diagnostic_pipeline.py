import logging
import time
from pathlib import Path
import hashlib
import os

logger = logging.getLogger(__name__)

class DiagnosticPipeline:
    """Orquestra o fluxo de diagnóstico completo."""
    
    def __init__(self, orchestrator):
        self.orc = orchestrator

    def execute(self, skip_tests=False):
        """Protocolo Soberano: Reset -> Discovery -> Verify -> Report."""
        start_time = time.time()
        logger.info("🎬 Iniciando Pipeline de Diagnóstico Soberano...")
        self._reset()
        
        # 1. Discovery
        ctx = self.orc.context_engine.analyze_project()
        findings = self.orc.run_strategic_audit(ctx, include_history=False)
        
        # 🕵️ Ofuscação
        findings.extend(self.orc._run_obfuscation_scan())
        
        # 2. Validation
        map_plan = self.orc.strategist.plan_targeted_verification(findings)
        
        if skip_tests:
            logger.info("🧪 [FastPath] Ignorando verificação core (unit tests)...")
            internal_health = {"success": True, "pass_rate": 100, "total_run": 0, "failed": 0, "pyramid": {}, "execution": {"success": True, "failed": 0}}
        else:
            # Usa os arquivos alterados detectados pelo orquestrador
            changed_paths = getattr(self.orc, 'last_detected_changes', [])
            # Fallback seguro extraído dos findings (com filtro de tipo para evitar crashes)
            if not changed_paths:
                changed_paths = [f.get("file") for f in findings if isinstance(f, dict) and f.get("file")]
            
            internal_health = self.orc.core_validator.verify_core_health(self.orc.project_root, changed_files=changed_paths)
        
        if findings:
            findings += self.orc._run_targeted_verification(map_plan)
            
        # 3. Dedupe & Report
        final_findings = self._deduplicate(findings)
        res = self._finalize(ctx, internal_health, final_findings)

        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_time, "✅ Pipeline concluído", level=logging.INFO)
        return res
    def _reset(self):
        self.orc.job_queue = []
        self.orc.metrics["all_findings"] = []
        if not self.orc.personas: 
            from src_local.utils.persona_loader import PersonaLoader
            PersonaLoader.mobilize_all(self.orc.project_root, self.orc)

    def _deduplicate(self, raw_findings):
        coord_map = {}
        severity_rank = {"CRITICAL": 5, "HIGH": 4, "MEDIUM": 3, "LOW": 2, "STRATEGIC": 1, "HEALED": 0}
        
        for f in raw_findings:
            if not isinstance(f, dict):
                h = hashlib.md5(str(f).encode()).hexdigest()
                if h not in coord_map: coord_map[h] = f
                continue
                
            path = str(f.get('file', 'global')).replace("\\", "/")
            key = (path, f.get('line', 0), f.get('issue'))
            
            if key not in coord_map:
                coord_map[key] = f
            else:
                curr = coord_map[key]
                if isinstance(curr, dict):
                    if severity_rank.get(f.get('severity', 'M').upper(), 0) > severity_rank.get(curr.get('severity', 'M').upper(), 0):
                        coord_map[key] = f
                        
        return list(coord_map.values())

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
        report = self.orc.director.format_360_report(snapshot, findings)
        
        report_file = self.orc.project_root / "auto_healing_VERIFIED.md"
        report_file.write_text(report, encoding="utf-8")
        return report_file