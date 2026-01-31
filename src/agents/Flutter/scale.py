from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class ScalePersona(BaseActivePersona):
    """
    Core: Flutter Architecture Specialist 🏗️
    Foca na organização do projeto, gerenciamento de estado e escalabilidade.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Scale"
        self.emoji = "🏗️"
        self.role = "Architecture Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando padrões de arquitetura e estado...")
        
        scale_rules = [
            {
                'regex': r"extends StatefulWidget", 
                'issue': 'Uso de StatefulWidget detectado. Avalie se o estado poderia ser gerenciado de forma mais desacoplada (BLoC, Riverpod).', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.dart'), scale_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Build a codebase that can scale to millions of users."
