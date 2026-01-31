from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class BridgePersona(BaseActivePersona):
    """
    Core: Flutter Native Integration Specialist 🌉
    Foca na comunicação entre Flutter e as plataformas nativas (Android/iOS).
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Bridge"
        self.emoji = "🌉"
        self.role = "Native Integration Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando MethodChannels e integrações nativas...")
        
        bridge_rules = [
            {
                'regex': r"MethodChannel\(", 
                'issue': 'Uso de MethodChannel detectado. Garanta que o nome do canal seja único e os erros sejam tratados com Try-Catch.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.dart'), bridge_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Bridge Flutter and Native code with seamless communication."
