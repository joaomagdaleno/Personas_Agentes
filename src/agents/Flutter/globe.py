from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class GlobePersona(BaseActivePersona):
    """Core: PhD in Mobile L10n (Flutter) 🌎"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Globe", "🌎", "PhD Mobile L10n", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando i18n Flutter...")
        
        audit_rules = [
            {'regex': r"text:\s+['"].*?['"]", 'issue': 'L10n: Widget Text com string hardcoded detectado.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "te" + "xt:" in content and "AppLocaliz" + "ations" not in content:
            return f"Débito de i18n: O objetivo '{objective}' exige alcance global. Em '{file}', strings hardcoded impedem a localização automática."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em localização Flutter."