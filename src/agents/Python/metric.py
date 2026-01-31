from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class MetricPersona(BaseActivePersona):
    """
    Core: Analytics Specialist 📊
    Foca na coleta de métricas, telemetria e análise de comportamento do sistema.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Metric"
        self.emoji = "📊"
        self.role = "Analytics Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando instrumentação de métricas e telemetria...")
        
        metric_rules = [
            {
                'regex': r"analytics\.track\(", 
                'issue': 'Ponto de rastreio de métricas detectado. Garanta que dados sensíveis (PII) não estejam sendo enviados.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.py'), metric_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Turn system behavior into actionable data."