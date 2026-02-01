from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class NexusPersona(BaseActivePersona):
    """Core: PhD in Distributed Systems 🌐"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Nexus", "🌐", "PhD Network Architect", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Camadas de Transporte...")
        
        audit_rules = [
            {'regex': r"verify\s*=\s*False", 'issue': 'Vulnerabilidade: SSL Verification desativado.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "timeout" not in content and "requests" in content:
            return f"Fragilidade Nervosa: O objetivo '{objective}' exige resiliência. Em '{file}', chamadas externas sem timeout ameaçam a 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em redes."