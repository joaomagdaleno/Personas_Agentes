from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class EchoPersona(BaseActivePersona):
    """
    Core: Kotlin Feedback Specialist 🗣️
    Foca na comunicação entre a aplicação e o usuário final através de elementos de UI.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Echo"
        self.emoji = "🗣️"
        self.role = "Feedback Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Analisando qualidade dos diálogos e avisos ao usuário...")
        
        echo_rules = [
            {
                'regex': r"Toast\.makeText", 
                'issue': 'Uso de Toast detectado. Para interfaces modernas, considere o uso de Snackbars que permitem ações de desfazer.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.kt'), echo_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Keep the user informed and engaged with clear feedback."
