from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class StreamPersona(BaseActivePersona):
    """
    Core: Kotlin Real-Time Specialist 📡
    Foca no processamento de fluxos de dados em tempo real e reatividade.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Stream"
        self.emoji = "📡"
        self.role = "Real-Time Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando fluxos reativos e dados em tempo real...")
        
        stream_rules = [
            {
                'regex': r"MutableStateFlow|MutableSharedFlow", 
                'issue': 'Uso de Kotlin Flows detectado. Garanta que a coleta (collect) seja feita de forma Lifecycle-aware no Compose.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.kt'), stream_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure data is always fresh and reactive."
