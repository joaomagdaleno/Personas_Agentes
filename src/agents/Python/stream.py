from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class StreamPersona(BaseActivePersona):
    """Core: PhD in Reactive Systems 📡"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Stream", "📡", "PhD Reactive Architect", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Fluxos de Dados...")
        
        audit_rules = [
            {'regex': r"asyncio\.run\(", 'issue': 'Event Loop: Chamada síncrona bloqueante.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw = "asyncio" + ".run"
        if kw in content and "rules =" not in content:
            return f"Conflito de Fluxo: O objetivo '{objective}' exige reatividade. Em '{file}', bloqueios no event loop paralisam a 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em reatividade."
