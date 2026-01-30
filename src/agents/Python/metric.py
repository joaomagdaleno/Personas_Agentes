from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class MetricPersona(BaseActivePersona):
    """
    Especialista em telemetria e monitoramento.
    Garante que o sistema seja mensurável e seus estados sejam visíveis.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Metric"
        self.emoji = "📊"
        self.role = "Observability Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Busca por falhas de instrumentação e logging manual."""
        logger.info(f"[{self.name}] Analisando instrumentação de logs...")
        
        patterns = [
            {
                'regex': r"print\(.*err.*|print\(.*fail.*", 
                'issue': 'Erro reportado via print. Use logger.error() para garantir persistência e níveis de severidade.', 
                'severity': 'medium'
            },
            {
                'regex': r"time\.time\(\)\s*-\s*start_time", 
                'issue': 'Medição de tempo manual detectada. Considere usar decoradores ou bibliotecas de métricas (Prometheus/StatsD).', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns('.py', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Make the system transparent and data-driven.'
