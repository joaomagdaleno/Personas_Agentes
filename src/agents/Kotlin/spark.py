from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class SparkPersona(BaseActivePersona):
    """
    Core: Kotlin Engagement Specialist ✨
    Foca no deleite do usuário através de animações e micro-interações no Android.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Spark"
        self.emoji = "✨"
        self.role = "Engagement Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Analisando elementos de animação e engajamento...")
        
        spark_rules = [
            {
                'regex': r"animate.*AsState", 
                'issue': 'Animação do Compose detectada. Excelente para fluidez da UI!', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.kt'), spark_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Create moments of delight that keep users coming back."
