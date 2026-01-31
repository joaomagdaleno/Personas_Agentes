from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class HermesPersona(BaseActivePersona):
    """
    Core: Flutter DevOps Specialist 📦
    Foca na automação de builds, entrega contínua (CD) e publicação nas lojas.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Hermes"
        self.emoji = "📦"
        self.role = "DevOps Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando configurações de build e release...")
        
        hermes_rules = [
            {
                'regex': r"android:versionCode\s*=\s*['\"]1['\"]", 
                'issue': 'VersionCode padrão (1) detectado. Lembre-se de incrementar para novos deploys na Play Store.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.yaml', '.xml', '.gradle'), hermes_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Automate the path from code to user's hands."

