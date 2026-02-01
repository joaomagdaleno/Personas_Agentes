from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class EchoPersona(BaseActivePersona):
    """Core: PhD in Observability 🗣️"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Echo", "🗣️", "PhD Observability Engineer", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Visibilidade e Rastreabilidade...")
        
        audit_rules = [
            {'regex': r"except Exception:\s+pass", 'issue': 'Cegueira: Exceção silenciada.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "pass" in content and "except" in content:
            return f"Cegueira Operacional: O objetivo '{objective}' exige diagnóstico. Em '{file}', o silenciamento de erros impede que a 'Orquestração de Inteligência Artificial' reporte falhas."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em observabilidade."