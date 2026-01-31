from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class GlobePersona(BaseActivePersona):
    """
    Core: Flutter i18n Specialist 🌎
    Foca na localização do app para diferentes culturas e idiomas.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Globe"
        self.emoji = "🌎"
        self.role = "i18n Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando suporte a multi-idioma (l10n)...")
        
        globe_rules = [
            {
                'regex': r"text:\s*['\"][A-Z][a-z]", # String hardcoded
                'issue': 'Texto visível hardcoded detectado. Use AppLocalizations ou Intl para suportar traduções.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.dart'), globe_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Make the app accessible and local for everyone on the planet."

