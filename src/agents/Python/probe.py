from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class ProbePersona(BaseActivePersona):
    """Core: PhD in Software Forensic 🔍"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Probe", "🔍", "PhD Diagnostics Engineer", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Integridade Forense...")
        
        audit_rules = [
            {'regex': r"except:\s+pass|except\s+Exception:\s+pass", 'issue': 'Risco Crítico: Erro silenciado.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "pass" in content and "except" in content:
            return f"Instabilidade Sistêmica: O objetivo '{objective}' exige resiliência. Em '{file}', falhas silenciosas impedem a cura da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em diagnósticos."