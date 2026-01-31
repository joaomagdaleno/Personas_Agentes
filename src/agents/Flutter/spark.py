from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class SparkPersona(BaseActivePersona):
    """
    Core: Flutter Engagement Specialist ✨
    Foca no engajamento do usuário através de animações e micro-interações.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Spark"
        self.emoji = "✨"
        self.role = "Engagement Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Analisando elementos de deleite e engajamento...")
        
        spark_rules = [
            {
                'regex': r"HapticFeedback", 
                'issue': 'Uso de feedback tátil detectado. Ótimo para imersão do usuário!', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.dart'), spark_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Turn every interaction into a moment of joy."
