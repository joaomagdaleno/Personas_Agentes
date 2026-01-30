from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class BoltPersona(BaseActivePersona):
    """
    Especialista em performance Python. 
    Foca em identificar loops ineficientes e padrões de bloqueio.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Bolt"
        self.emoji = "⚡"
        self.role = "Performance Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Audita gargalos de performance usando padrões conhecidos."""
        logger.info(f"[{self.name}] Analisando performance em {self.project_root}")
        
        patterns = [
            {
                'regex': r"for .* in .*:.*time\.sleep", 
                'issue': 'Polling ineficiente: time.sleep detectado dentro de loop.', 
                'severity': 'medium'
            },
            {
                'regex': r"while True:.*time\.sleep", 
                'issue': 'Loop infinito com sleep (polling). Considere usar eventos ou webhooks.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns('.py', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Optimize execution speed and resources.'
