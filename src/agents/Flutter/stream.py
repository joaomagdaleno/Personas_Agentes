from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class StreamPersona(BaseActivePersona):
    """
    Core: Flutter Real-Time Specialist 📡
    Foca no processamento de fluxos de dados (Streams) e comunicação reativa.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Stream"
        self.emoji = "📡"
        self.role = "Real-Time Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando reatividade e fluxos de dados...")
        
        stream_rules = [
            {
                'regex': r"StreamBuilder\(", 
                'issue': 'Uso de StreamBuilder detectado. Garanta o fechamento dos Streams nos métodos de dispose.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.dart'), stream_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure data flows instantly and correctly."
