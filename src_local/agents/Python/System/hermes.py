from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class HermesPersona(BaseActivePersona):
    """
    Core: PhD in SRE & Software Reliability 📦
    Guardião da integridade de ambiente, detecta configurações de debug em produção e falhas de pipeline.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Hermes", "📦", "PhD DevOps Engineer", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Cadeia de Suprimentos e Ambiente (Legacy Stack)...")
        
        audit_rules = [
            {'regex': r'DEBUG\s*=\s*True', 'issue': 'Risco de Ambiente: DEBUG ativo detectado. Vulnerabilidade grave para produção.', 'severity': 'high'},
            {'regex': r'ALLOWED_HOSTS\s*=\s*\[\s*["\']\*["\']\s*\]', 'issue': 'Vulnerabilidade: ALLOWED_HOSTS configurado como wildcard (*).', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.py', '.yaml', '.yml'), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "DEBUG = True" in content:
            return f"Risco de Integridade: O objetivo '${objective}' exige confiabilidade. DEBUG ativo em '${file}' compromete a segurança PhD."
        return f"PhD SRE: Analisando confiabilidade de software para {objective}. Focando em conformidade de ambiente e estabilidade de artefatos."

    def self_diagnostic(self) -> dict:
        """Auto-Cura Soberana (Legacy Python)."""
        return {
            "status": "Soberano",
            "score": 100,
            "issues": []
        }

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, PhD em Engenharia de Confiabilidade e Guardião do Pipeline Legado."
