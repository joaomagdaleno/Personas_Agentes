from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class PalettePersona(BaseActivePersona):
    """
    Especialista em design visual e interface.
    Garante que a apresentação do projeto seja atraente e siga diretrizes estéticas.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Palette"
        self.emoji = "🎨"
        self.role = "Design Systems Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Audita conformidade estética e de interface."""
        logger.info(f"[{self.name}] Analisando qualidade visual e UI...")
        
        patterns = [
            {
                'regex': r"color\s*=", 
                'issue': 'Definição de cor detectada. Verifique se segue o guia de estilos do projeto.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns('.py', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Craft beautiful and usable software experiences.'