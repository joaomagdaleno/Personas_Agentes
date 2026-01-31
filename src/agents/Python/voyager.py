from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class VoyagerPersona(BaseActivePersona):
    """
    Core: Innovation Specialist 🚀
    Foca na exploração de novas tecnologias, padrões modernos e evolução tecnológica.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Voyager"
        self.emoji = "🚀"
        self.role = "Innovation Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Explorando oportunidades de evolução tecnológica...")
        
        voyager_rules = [
            {
                'regex': r"python2|os\.path\.", 
                'issue': 'Padrões antigos detectados. Considere migrar para Python 3.10+ e usar a biblioteca "pathlib".', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.py'), voyager_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Push the boundaries of technology and keep the project at the cutting edge."