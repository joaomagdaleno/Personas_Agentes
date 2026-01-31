from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class ScribePersona(BaseActivePersona):
    """
    Core: Kotlin Documentation Specialist ✍️
    Foca na clareza do código através de KDoc e documentação técnica.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Scribe"
        self.emoji = "✍️"
        self.role = "Documentation Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando qualidade do KDoc e legibilidade...")
        
        scribe_rules = [
            {
                'regex': r"/\*\*", 
                'issue': 'KDoc detectado. Garanta que as funções públicas estejam bem documentadas.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.kt'), scribe_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure the code is self-explanatory and well-documented."
