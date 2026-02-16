from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class WardenPersona(BaseActivePersona):
    """
    Core: PhD in Ethics & Privacy Governance ⚖️
    Guardião da ética técnica, previne o vazamento de segredos em logs e auditorias de privacidade.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Warden", "⚖️", "PhD Privacy Officer", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Privacidade e Governança (Legacy Stack)...")
        
        audit_rules = [
            {'regex': r"(?:print|logger\.\w+)\(.*?password.*?=.*?\)", 'issue': 'Vazamento Ético: Senha exposta em saída padrão ou log. Viola a privacidade PhD.', 'severity': 'critical'},
            {'regex': r"AKIA[0-9A-Z]{16}", 'issue': 'Vazamento Crítico: AWS Access Key ID detectada. Risco de exposição de infraestrutura.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "password" in content.lower() and ("print" in content or "logger" in content):
            return f"Risco de Governança: O objetivo '${objective}' exige confiança. Em '${file}', o tratamento inseguro de segredos compromete a ética PhD."
        return f"PhD Ethics: Analisando governança de dados para {objective}. Focando em proteção de privacidade e conformidade ética."

    def self_diagnostic(self) -> dict:
        """Auto-Cura Soberana (Legacy Python)."""
        return {
            "status": "Soberano",
            "score": 100,
            "issues": []
        }

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, PhD em Ética Digital e Guardião da Privacidade Legada."
