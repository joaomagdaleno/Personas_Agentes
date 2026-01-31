from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class ScribePersona(BaseActivePersona):
    """
    Core: Flutter Documentation Specialist ✍️
    Foca na legibilidade do código e documentação técnica DartDoc.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Scribe"
        self.emoji = "✍️"
        self.role = "Documentation Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando qualidade da documentação Dart...")
        
        scribe_rules = [
            {
                'regex': r"///", 
                'issue': 'Comentário DartDoc detectado. Excelente! Garanta que os parâmetros e retornos estejam descritos.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.dart'), scribe_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Make the codebase a reference for clarity and knowledge."
