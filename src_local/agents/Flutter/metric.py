"""
SISTEMA DE PERSONAS AGENTES - NÚCLEO FLUTTER
Módulo: Métrica de Telemetria (Metric)
Função: Analisar a densidade de eventos analíticos e instrumentação de performance.
Soberania: ACTIVE-AGENT.
"""
from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class MetricPersona(BaseActivePersona):
    """
    Core: PhD in Statistics & System Instrumentation (Flutter) 📊
    
    Responsabilidades:
    1. Compliance Analítico: Valida se eventos seguem o esquema oficial.
    2. Detecção de Anomalias: Identifica gargalos via telemetria passiva.
    3. Instrumentação: Audita o uso de ferramentas de performance em Dart.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Metric", "📊", "PhD Telemetry Engineer", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Instrumentação Flutter...")
        
        audit_rules = [
            {'regex': r"logEvent\(", 'issue': 'Aviso: Evento analítico detectado. Verifique se segue o schema oficial.', 'severity': 'low'},
            {'regex': r"print\(", 'issue': 'Saída não rastreável: Use o sistema de logs estruturado.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "print(" in content:
            return f"Cegueira Analítica: O objetivo '{objective}' exige observabilidade. Em '{file}', o uso de saídas não rastreáveis impede a extração de métricas para a 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em telemetria e análise Flutter."
