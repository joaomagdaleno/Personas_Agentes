from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class HypePersona(BaseActivePersona):
    """
    Core: Kotlin Growth Specialist 📣
    Foca em visibilidade, ASO e engajamento inicial do usuário no Android.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Hype"
        self.emoji = "📣"
        self.role = "Growth Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando configurações de visibilidade e aquisição...")
        
        hype_rules = [
            {
                'regex': r"android:host", 
                'issue': 'Deep Link detectado no AndroidManifest. Garanta a validação correta do domínio (App Links).', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.xml'), hype_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Drive growth through technical excellence."
