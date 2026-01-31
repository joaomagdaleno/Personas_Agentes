from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class HypePersona(BaseActivePersona):
    """
    Core: Flutter Marketing Specialist 📣
    Foca em ASO (App Store Optimization), Deep Links e presença nas lojas.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Hype"
        self.emoji = "📣"
        self.role = "Marketing Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando visibilidade e conversão do app...")
        
        hype_rules = [
            {
                'regex': r"intent-filter", # Deep links
                'issue': 'Configurações de Intent detectadas. Garanta que os Deep Links estejam apontando para as rotas corretas.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.xml', '.plist'), hype_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Make the app irresistible and easy to find."
