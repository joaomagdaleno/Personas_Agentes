from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class SparkPersona(BaseActivePersona):
    """
    Especialista em engajamento e motivação.
    Foca em identificar pendências e incentivar a conclusão de tarefas.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Spark"
        self.emoji = "✨"
        self.role = "Engagement Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Audita lembretes de tarefas pendentes."""
        logger.info(f"[{self.name}] Buscando pendências de desenvolvimento...")
        
        patterns = [
            {
                'regex': r"TODO:|FIXME:|HACK:", 
                'issue': 'Lembrete de tarefa pendente detectado. Considere priorizar a conclusão deste Spark.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns('.py', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Energize the team and clear the path of pending tasks.'
