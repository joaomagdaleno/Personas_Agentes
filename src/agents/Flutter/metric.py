from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class MetricPersona(BaseActivePersona):
    """
    Core: Flutter Analytics Specialist 📊
    Foca na mensuração de eventos, comportamento do usuário e KPIs de negócio.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Metric"
        self.emoji = "📊"
        self.role = "Analytics Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando instrumentação de telemetria...")
        
        metric_rules = [
            {
                'regex': r"FirebaseAnalytics\.instance\.logEvent\(", 
                'issue': 'Rastreamento de evento detectado. Verifique se os nomes dos eventos seguem um padrão de nomenclatura.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.dart'), metric_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Turn every tap into a data-driven decision."
