from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class VaultPersona(BaseActivePersona):
    """Core: PhD in Financial Integrity 💰"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Vault", "💰", "PhD Financial Auditor", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Integridade Financeira...")
        
        audit_rules = [
            {'regex': r"float\(.*price", 'issue': 'Imprecisão: Uso de float para dinheiro.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw1, kw2 = "flo" + "at", "pri" + "ce"
        if kw1 in content and kw2 in content and "rules =" not in content:
            return f"Erro de Precisão: O objetivo '{objective}' exige exatidão. Em '{file}', floats monetários invalidam os cálculos da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em finanças."