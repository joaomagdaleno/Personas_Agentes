from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class EchoPersona(BaseActivePersona):
    """
    Core: Flutter Feedback Specialist 🗣️
    Foca na comunicação entre o app e o usuário (diálogos, toasts, feedbacks).
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Echo"
        self.emoji = "🗣️"
        self.role = "Feedback Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Analisando qualidade dos feedbacks ao usuário...")
        
        echo_rules = [
            {
                'regex': r"showDialog\(", 
                'issue': 'Diálogo genérico detectado. Garanta que o botão de fechar/cancelar esteja acessível.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.dart'), echo_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure the user always knows what is happening in the app."
