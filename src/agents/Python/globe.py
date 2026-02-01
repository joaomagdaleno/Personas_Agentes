from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class GlobePersona(BaseActivePersona):
    """Core: PhD in Linguistics 🌎"""
    def __init__(self, p):
        super().__init__(p)
        self.name, self.emoji, self.role, self.stack = "Globe", "🌎", "PhD Localization", "Python"

    def perform_audit(self) -> list:
        s = time.time()
        logger.info(f"[{self.name}] Analisando...")
        r = self.find_patterns(('.py',), [{'regex': r"i18n", 'issue': 'Missing', 'severity': 'low'}])
        self._log_performance(s, len(r))
        return r

    def _reason_about_objective(self, o, f, c): return None
    def get_system_prompt(self): return f"Dr. {self.name}"
