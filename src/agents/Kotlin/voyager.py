from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class VoyagerPersona(BaseActivePersona):
    """
    Core: Kotlin Innovation Specialist 🚀
    Foca na exploração de tecnologias de ponta, como Kotlin Multiplatform (KMP).
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Voyager"
        self.emoji = "🚀"
        self.role = "Innovation Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Explorando oportunidades com KMP e novas APIs do Android...")
        
        voyager_rules = [
            {
                'regex': r"expect\s+class|actual\s+class", 
                'issue': 'Padrão Kotlin Multiplatform detectado. Ótima escolha para compartilhamento de código!', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.kt'), voyager_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Lead the project to the frontier of Kotlin development."
