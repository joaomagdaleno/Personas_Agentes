from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class VoyagerPersona(BaseActivePersona):
    """
    Especialista em inovação e exploração tecnológica.
    Identifica oportunidades de melhoria e caminhos de evolução do projeto.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Voyager"
        self.emoji = "🚀"
        self.role = "Innovation Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Busca por tecnologias obsoletas e oportunidades de upgrade."""
        logger.info(f"[{self.name}] Explorando novas fronteiras técnicas...")
        
        patterns = [
            {
                'regex': r"python2|print\s+['\"] பரிசு ['\"]", # Padrões do passado
                'issue': 'Referência a legado (Python 2) ou sintaxe obsoleta detectada. Considere modernizar.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns('.py', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Guide the project through unknown technical territories and keep it modern.'
