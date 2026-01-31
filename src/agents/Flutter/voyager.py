from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class VoyagerPersona(BaseActivePersona):
    """
    Core: Flutter Innovation Specialist 🚀
    Foca na atualização tecnológica e adoção de novos recursos do Dart e Flutter.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Voyager"
        self.emoji = "🚀"
        self.role = "Innovation Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Explorando melhorias com recursos modernos do Flutter...")
        
        voyager_rules = [
            {
                'regex': r"switch\s*\(.*\)\s*\{", 
                'issue': 'Switch case detectado. No Dart 3, prefira o uso de Switch Expressions para código mais conciso.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.dart'), voyager_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Lead the app to the future of mobile development."
