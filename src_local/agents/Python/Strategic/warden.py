from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class WardenPersona(BaseActivePersona):
    """Core: PhD in Ethics ⚖️"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Warden", "⚖️", "PhD Privacy Officer", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Privacidade...")
        
        # Regex calibrado para detectar prints ou logs de senhas/tokens
        audit_rules = [
            {'regex': r"(?:print|logger\.\w+)\(.*?password.*?=.*?\)", 'issue': 'Leak: Senha em stdout/log.', 'severity': 'critical'},
            {'regex': r"AKIA[0-9A-Z]{16}", 'issue': 'Vazamento: AWS Access Key ID detectada.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        # O Warden agora delega a auditoria de ética para o AuditEngine via perform_audit
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da ética."
