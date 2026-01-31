from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class ScalePersona(BaseActivePersona):
    """
    Core: Kotlin Architecture Specialist 🏗️
    Foca na modularização, injeção de dependência (Hilt) e padrões arquiteturais.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Scale"
        self.emoji = "🏗️"
        self.role = "Architecture Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando estrutura do projeto e injeção de dependência...")
        
        scale_rules = [
            {
                'regex': r"@HiltAndroidApp", 
                'issue': 'Uso de Hilt detectado. Excelente para escalabilidade e testes!', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.kt', '.gradle'), scale_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure the Android project is modular and easily scalable."
