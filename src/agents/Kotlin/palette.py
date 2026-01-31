from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class PalettePersona(BaseActivePersona):
    """
    Core: Kotlin UX Specialist 🎨
    Foca na interface Jetpack Compose, fidelidade ao Material Design e acessibilidade.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Palette"
        self.emoji = "🎨"
        self.role = "UX Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando estética e acessibilidade no Android...")
        
        palette_rules = [
            {
                'regex': r"contentDescription\s*=\s*null", 
                'issue': 'Elemento de UI sem descrição de conteúdo (contentDescription=null). Isso quebra a acessibilidade para TalkBack.', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns(('.kt'), palette_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Craft beautiful and highly accessible Android interfaces."
