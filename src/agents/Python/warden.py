from src.agents.base import BaseActivePersona
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
        
        audit_rules = [
            {'regex': r"print\(.*password.*=.*\)", 'issue': 'Leak: Senha em stdout.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "password" in content:
            return f"Risco Ético: O objetivo '{objective}' exige governança. Em '{file}', vazamentos de credenciais ameaçam a 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da ética."