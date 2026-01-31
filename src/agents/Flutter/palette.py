from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class PalettePersona(BaseActivePersona):
    """
    Core: Flutter UX Specialist 🎨
    Foca na interface do usuário, fidelidade visual e acessibilidade.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Palette"
        self.emoji = "🎨"
        self.role = "UX Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando qualidade visual e acessibilidade...")
        
        palette_rules = [
            {
                'regex': r"Container\(.*color:", 
                'issue': 'Definição de cor direta no Container. Prefira usar o ColorScheme do Theme para suporte a Dark Mode.', 
                'severity': 'low'
            },
            {
                'regex': r"Semantics\(", 
                'issue': 'Widget de Semântica detectado. Excelente prática para acessibilidade!', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.dart'), palette_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Craft beautiful and inclusive mobile experiences."
