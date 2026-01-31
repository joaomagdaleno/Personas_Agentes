from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class GlobePersona(BaseActivePersona):
    """
    Core: Localization Specialist 🌎
    Foca em internacionalização (i18n), localização (l10n) e suporte multi-idioma.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Globe"
        self.emoji = "🌎"
        self.role = "Localization Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando suporte a idiomas e cultura...")
        
        globe_rules = [
            {
                'regex': r"['\"][A-Z][a-z]+ [a-z]+['\"]", # String literal em inglês
                'issue': 'String literal detectada fora de um sistema de tradução (gettext). Isso dificulta a localização.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.py', '.html'), globe_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Make the application ready for a global audience."

