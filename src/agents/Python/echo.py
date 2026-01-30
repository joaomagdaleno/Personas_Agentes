from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class EchoPersona(BaseActivePersona):
    """
    Especialista em UX e Feedback.
    Garante que a comunicação entre agente e usuário seja fluida.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Echo"
        self.emoji = "🗣️"
        self.role = "UX & Feedback Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Audita interações sem feedback."""
        logger.info(f"[{self.name}] Analisando qualidade da interação...")
        
        patterns = [
            {
                'regex': r"input(.*)[" 
"s\n]*(?!.*(print|logger|display))", 
                'issue': 'Captura de input sem feedback visual imediato ao usuário.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns('.py', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Ensure every action has a clear response.'
