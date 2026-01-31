from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class ScalePersona(BaseActivePersona):
    """
    Core: Scalability & Architecture Specialist 🏗️
    Foca na estrutura modular, escalabilidade e arquitetura de longo prazo.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Scale"
        self.emoji = "🏗️"
        self.role = "Architecture Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando modularidade e arquitetura...")
        
        scale_rules = [
            {
                'regex': r"import .*\bfrom\s+\.\b", # Importação circular ou local confusa
                'issue': 'Importação relativa detectada. Em grandes sistemas, prefira caminhos absolutos para evitar dependências circulares.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.py'), scale_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Build a foundation that can grow indefinitely."