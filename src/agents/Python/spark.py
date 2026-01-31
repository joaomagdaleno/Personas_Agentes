from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class SparkPersona(BaseActivePersona):
    """
    Core: Engagement Specialist ✨
    Foca em mecânicas de gamificação, interação social e retenção de usuários.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Spark"
        self.emoji = "✨"
        self.role = "Engagement Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Analisando mecânicas de engajamento e feedback...")
        
        spark_rules = [
            {
                'regex': r"points|badges|leaderboard", 
                'issue': 'Termos de gamificação detectados. Garanta que a lógica de progressão seja justa e clara.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.py'), spark_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Turn utility into delight and engagement."