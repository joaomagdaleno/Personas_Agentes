from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class StreamPersona(BaseActivePersona):
    """
    Especialista em Real-Time e streaming.
    Garante que a comunicação bidirecional seja resiliente.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Stream"
        self.emoji = "📡"
        self.role = "Real-Time Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Audita conexões de rede e persistência de stream."""
        logger.info(f"[{self.name}] Validando lógica de streaming...")
        
        patterns = [
            {
                'regex': r"socket\.|websocket", 
                'issue': 'Lógica de socket detectada. Verifique o tratamento de reconexão automática.', 
                'severity': 'medium'
            },
            {
                'regex': r"while True:.*recv\(", 
                'issue': 'Loop de recepção bloqueante detectado. Considere usar padrões assíncronos (asyncio).', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns('.py', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Maintain flow and resilience in real-time interactions.'
