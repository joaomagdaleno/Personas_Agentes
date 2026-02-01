from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class GlobePersona(BaseActivePersona):
    """
    Core: PhD in Linguistics & Global Information Distribution (Flutter) 🌎
    Especialista em internacionalização (arb), adaptação cultural e distribuição global.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Globe", "🌎", "PhD Localization Specialist", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Localização e i18n Flutter...")
        
        audit_rules = [
            {'regex': r"Text\(\s*['\"].*?['"]", 'issue': 'Aviso: String Hardcoded detectada. Use AppLocalizations ou .arb.', 'severity': 'high'},
            {'regex': r"DateTime\.now\(\")", 'issue': 'Aviso: Uso de hora local. Verifique se deve usar UTC para consistência global.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "Text('" in content or 'Text("' in content:
            return f"Barreira Linguística: O objetivo '{objective}' exige alcance global. Em '{file}', o uso de strings fixas impede a 'Orquestração de Inteligência Artificial' de se adaptar a novos mercados."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em distribuição global Flutter."
