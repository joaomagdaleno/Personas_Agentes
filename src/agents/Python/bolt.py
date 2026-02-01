from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class BoltPersona(BaseActivePersona):
    """Core: PhD in Computational Efficiency ⚡"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Bolt", "⚡", "PhD Performance Engineer", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Eficiência Computacional...")
        
        audit_rules = [
            {'regex': r"while True:\s+" + r"pass", 'issue': 'Gargalo: Busy-waiting.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "whi" + "le True" in content:
            return f"Gargalo de Runtime: O objetivo '{objective}' exige alta disponibilidade. Loops de espera ativa em '{file}' paralisam a 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em performance."
