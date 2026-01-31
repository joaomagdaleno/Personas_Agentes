from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class WardenPersona(BaseActivePersona):
    """
    Core: Kotlin Compliance Specialist ⚖️
    Foca na conformidade legal, permissões de sistema e privacidade no ecossistema Android.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Warden"
        self.emoji = "⚖️"
        self.role = "Compliance Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando conformidade com as políticas do Google Play...")
        
        warden_rules = [
            {
                'regex': r"requestPermissions", 
                'issue': 'Solicitação de permissão detectada. No Android 13+, garanta que a permissão de notificações seja tratada separadamente.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.kt', '.xml'), warden_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Guard the application's legal and ethical standing."
