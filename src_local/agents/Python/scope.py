from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class ScopePersona(BaseActivePersona):
    """Core: PhD in Product Management 🔭"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Scope", "🔭", "PhD Product Architect", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Escopo...")
        
        audit_rules = [
            {'regex': r"TODO:|FIXME:", 'issue': 'Débito: Pendência detectada.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.py', '.md'), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "TODO" in content:
            return f"Incompleitude: O objetivo '{objective}' exige entrega. Em '{file}', débitos pendentes retardam a 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em gestão."
