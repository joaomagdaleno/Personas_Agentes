from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class NebulaPersona(BaseActivePersona):
    """
    Core: Kotlin Cloud Specialist ☁️
    Foca na integração com serviços em nuvem (Firebase, AWS) e backend mobile.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Nebula"
        self.emoji = "☁️"
        self.role = "Cloud Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando integração com infraestrutura em nuvem...")
        
        nebula_rules = [
            {
                'regex': r"FirebaseMessaging\.getInstance", 
                'issue': 'Serviço de notificações detectado. Garanta o tratamento correto de tokens para entrega de mensagens.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.kt'), nebula_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Cloud-power the Android experience."
