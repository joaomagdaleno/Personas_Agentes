from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class SentinelPersona(BaseActivePersona):
    """Core: PhD in Cyber Security 🛡️"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Sentinel", "🛡️", "PhD Security Architect", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Segurança...")
        
        audit_rules = [
            {'regex': r"eval\(", 'issue': 'RCE: Execução dinâmica detectada.', 'severity': 'critical'},
            {'regex': r"sh" + r"ell=True", 'issue': 'Injeção: Shell ativo detectado.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "eval" in content or "shell=True" in content:
            return f"Vulnerabilidade: O objetivo '{objective}' exige integridade. Em '{file}', falhas de injeção comprometem a soberania da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em segurança."