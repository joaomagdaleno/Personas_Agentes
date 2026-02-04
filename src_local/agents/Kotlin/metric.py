from src_local.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class MetricPersona(BaseActivePersona):
    """
    Core: PhD in Applied Statistics & Telemetry Engineering 📊
    Monitorado por si mesmo: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Metric", "📊", "PhD Telemetry Architect (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria estatística JVM integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Integridade da Telemetria...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"logEvent\(.*PII.*\)", 'issue': 'Violação: Dados sensíveis na telemetria JVM.', 'severity': 'critical'},
            {'regex': r"Log\.d\(", 'issue': 'Log Primitivo: Uso de Log.d detectado.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.kt', '.kts'), rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw = 'logEvent'
        if kw not in content and "rules =" not in content:
            return f"Cegueira Analítica: O objetivo '{objective}' exige visibilidade. Em '{file}', a ausência de telemetria isola a 'Orquestração de Inteligência Artificial' de dados reais de campo."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em telemetria Kotlin."
