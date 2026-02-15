import logging

logger = logging.getLogger(__name__)

class ValidationAgent:
    """Agente especialista em validação técnica e execução de testes vitais."""
    
    def __init__(self, orchestrator):
        self.orc = orchestrator

    def run_validation_phase(self, findings, skip_tests):
        """Coordena o planejamento e execução das verificações cirúrgicas."""
        if skip_tests: return self._fast_fallback()
        
        # Mapeamento do plano
        plan = self.orc.strategist.plan_targeted_verification(findings)
        if findings:
            findings += self.orc._run_targeted_verification(plan)
            
        # Resolução de arquivos alterados para o validador
        target_files = getattr(self.orc, 'last_detected_changes', [])
        if not target_files:
            target_files = [f.get("file") for f in findings if isinstance(f, dict) and f.get("file")]
            
        return self.orc.core_validator.verify_core_health(self.orc.project_root, target_files)

    def _fast_fallback(self):
        return {"success": True, "pass_rate": 100, "total_run": 0, "failed": 0, "pyramid": {}, "execution": {"success": True}}
