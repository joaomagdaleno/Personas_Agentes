from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class HermesPersona(BaseActivePersona):
    """Core: PhD in SRE 📦"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Hermes", "📦", "PhD DevOps Engineer", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Cadeia de Suprimentos...")
        
        audit_rules = [
            {'regex': 'DEBUG\\s*=\\s*True', 'issue': 'Ambiente: DEBUG ativo em produção.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.py', '.yaml'), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if 'DEBUG = True' in content:
            return f"Vulnerabilidade de Ambiente: O objetivo '{objective}' exige isolamento. Em '{file}', o debug ativo expõe a 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em SRE."
