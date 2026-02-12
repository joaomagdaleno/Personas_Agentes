from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class GlobePersona(BaseActivePersona):
    """
    Core: PhD in Globalization & L10n Strategy 🌎
    Especialista em conformidade i18n, suporte a múltiplos idiomas e encoding.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Globe", "🌎", "PhD L10n Strategist", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Globalização...")
        
        audit_rules = [
            {'regex': r"print\(.*?[áéíóúãõç].*?\)", 'issue': 'L10n: String hardcoded com caracteres locais.', 'severity': 'low'},
            {'regex': r"open\((?![^)]*['\"](\w*b\w*)['\"])(?![^)]*encoding\s*=).*?\)", 'issue': 'Encoding: open() sem encoding explícito.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if 'open(' in content and 'encoding' not in content:
            return f"Risco de Localização: O objetivo '{objective}' exige portabilidade global. Em '{file}', o uso de open() sem encoding UTF-8 pode corromper dados."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em globalização de software."
