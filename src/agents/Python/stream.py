from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class StreamPersona(BaseActivePersona):
    """
    Core: Real-Time Specialist 📡
    Foca em processamento de fluxos de dados, WebSockets e reatividade em tempo real.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Stream"
        self.emoji = "📡"
        self.role = "Real-Time Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando fluxos de dados em tempo real e reatividade...")
        
        stream_rules = [
            {
                'regex': r"websocket\.send\(", 
                'issue': 'Ponto de envio de WebSocket detectado. Garanta o tratamento de desconexão e reconexão automática.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.py'), stream_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure data flows smoothly and instantly."