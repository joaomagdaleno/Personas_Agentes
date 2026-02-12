from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class SparkPersona(BaseActivePersona):
    """Core: PhD in User Engagement ✨"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Spark", "✨", "PhD Engagement Architect", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Deleite do Usuário...")
        
        audit_rules = [
            {'regex': r"print\(", 'issue': 'Interface: Uso de print para interação bruta.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em engajamento."
