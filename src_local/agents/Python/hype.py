from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class HypePersona(BaseActivePersona):
    """Core: PhD in Growth 📣"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Hype", "📣", "PhD Growth Engineer", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Vetores de Crescimento...")
        
        audit_rules = [
            {'regex': r"<title>.*</title>", 'issue': 'SEO: Tag de título detectada.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.py', '.html'), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if 'Untitled' in content:
            return f"Invisibilidade: O objetivo '{objective}' exige tração. Em '{file}', a falta de metadados prejudica a descoberta do valor do projeto."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em crescimento."
