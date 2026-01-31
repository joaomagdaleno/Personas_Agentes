from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class SentinelPersona(BaseActivePersona):
    """
    Core: Kotlin Security Specialist 🛡️
    Foca na proteção de dados sensíveis e segurança da aplicação Android.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Sentinel"
        self.emoji = "🛡️"
        self.role = "Security Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando segurança e privacidade de dados...")
        
        sentinel_rules = [
            {
                'regex': r"http://", 
                'issue': 'Tráfego HTTP não criptografado detectado. Use HTTPS para proteger os dados do usuário.', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns(('.kt', '.xml'), sentinel_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Guard the application and user data against all threats."
