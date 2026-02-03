from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class ScalePersona(BaseActivePersona):
    """Core: PhD in Architecture 🏗️"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Scale", "🏗️", "PhD Software Architect", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Acoplamento...")
        
        audit_rules = [
            {'regex': r"\bglobal\s+\w+", 'issue': 'Violação: Uso de estado global.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw = "glob" + "al "
        if kw in content and "rules =" not in content:
            return f"Risco de Escalabilidade: O objetivo '{objective}' exige modularidade. Em '{file}', a poluição de estado impede a 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em arquitetura."
