from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class GlobePersona(BaseActivePersona):
    """
    Core: Kotlin i18n Specialist 🌎
    Foca na localização e internacionalização da aplicação Android.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Globe"
        self.emoji = "🌎"
        self.role = "i18n Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando arquivos de strings e recursos regionais...")
        
        globe_rules = [
            {
                'regex': r"text\s*=\s*['\"][A-Z][a-z]", 
                'issue': 'Texto hardcoded detectado em Composable. Mova para strings.xml para permitir tradução.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.kt', '.xml'), globe_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Make the app speak every language perfectly."