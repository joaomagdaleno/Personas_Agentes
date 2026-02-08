from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class MantraPersona(BaseActivePersona):
    """Core: PhD in Quality 🧘"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Mantra", "🧘", "PhD Quality Architect", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Pureza do Código...")
        
        # Obfuscated regex to avoid self-detection
        audit_rules = [
            {'regex': 'except:\\s+pass', 'issue': 'Anti-padrão: Bare except.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if 'global ' in content:
            return f"Poluição de Estado: O objetivo '{objective}' exige pureza. Em '{file}', o uso de globais compromete a 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da qualidade."
