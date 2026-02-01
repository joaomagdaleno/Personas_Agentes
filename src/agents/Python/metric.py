from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class MetricPersona(BaseActivePersona):
    """
    Core: PhD in Applied Statistics & Telemetry Engineering 📊
    PhD Standard: Erradicação de telemetria manual dispersa.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Metric", "📊", "PhD Data Engineer", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Validando Instrumentação de Telemetria...")
        
        audit_rules = [
            {
                'regex': r"time\.time\(\)\s*-\s*start_time", 
                'issue': 'Telemetria Manual: Use o utilitário _log_performance da Base.', 
                'severity': 'low'
            },
            {
                'regex': r"(?<!logger\.)print\(", 
                'issue': 'Saída não rastreável: Use logger em vez de print.', 
                'severity': 'medium'
            }
        ]
        
        results = self.find_patterns(('.py', '.dart', '.kt'), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "logger" not in content.lower():
            return f"Cegueira Analítica: O objetivo '{objective}' exige observabilidade. Em '{file}', a falta de telemetria estruturada impede a gestão da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da precisão estatística."