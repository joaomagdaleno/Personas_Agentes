from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class HermesPersona(BaseActivePersona):
    """
    Core: Kotlin DevOps Specialist 📦
    Foca na configuração de builds Gradle, ofuscação de código e entrega nas lojas.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Hermes"
        self.emoji = "📦"
        self.role = "DevOps Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando scripts de build e configurações de release...")
        
        hermes_rules = [
            {
                'regex': r"minifyEnabled\s+false", 
                'issue': 'Ofuscação (Proguard/R8) desativada para a versão de release. Isso aumenta o tamanho do APK e reduz a segurança.', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns(('.kts', '.gradle'), hermes_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure a smooth and secure path to production."
