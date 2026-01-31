from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class WardenPersona(BaseActivePersona):
    """
    Core: Flutter Compliance Specialist ⚖️
    Foca na privacidade de dados e conformidade com as diretrizes das lojas.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Warden"
        self.emoji = "⚖️"
        self.role = "Compliance Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando conformidade e permissões de usuário...")
        
        warden_rules = [
            {
                'regex': r"Permission\..*\.request\(", 
                'issue': 'Solicitação de permissão detectada. Garanta que haja uma explicação clara para o usuário sobre o porquê dela ser necessária.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.dart', '.xml', '.plist'), warden_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Protect the app and the user within legal boundaries."
