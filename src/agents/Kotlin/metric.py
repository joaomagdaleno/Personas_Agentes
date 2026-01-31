from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class MetricPersona(BaseActivePersona):
    """
    Core: Kotlin Analytics Specialist 📊
    Foca na mensuração de comportamento do usuário e telemetria no Android.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Metric"
        self.emoji = "📊"
        self.role = "Analytics Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando instrumentação de dados e eventos...")
        
        metric_rules = [
            {
                'regex': r"Firebase\.analytics\.logEvent", 
                'issue': 'Rastreamento de evento detectado. Verifique se os nomes seguem o padrão snake_case recomendado.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.kt'), metric_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Turn every user action into valuable insights."
