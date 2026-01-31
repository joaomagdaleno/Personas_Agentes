from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class SentinelPersona(BaseActivePersona):
    """
    Core: Flutter Security Specialist 🛡️
    Foca na proteção de dados, segurança de rede e integridade do binário.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Sentinel"
        self.emoji = "🛡️"
        self.role = "Security Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando segurança e proteção de dados mobile...")
        
        sentinel_rules = [
            {
                'regex': r"http://", 
                'issue': 'Uso de tráfego HTTP não criptografado. Mobile apps devem usar HTTPS obrigatoriamente.', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns(('.dart'), sentinel_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Guard the app against every digital threat."
