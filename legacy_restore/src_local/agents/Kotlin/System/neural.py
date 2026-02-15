from src_local.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class NeuralPersona(BaseActivePersona):
    """
    Core: PhD in Applied AI & Android Machine Learning 🧠
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Neural", "🧠", "PhD AI Architect (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria de processamento neural integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Pipelines de IA...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"mlkit", 'issue': 'Risco de Dependência: Uso de ML Kit detectado.', 'severity': 'low'},
            {'regex': r"Interpreter\.fromBuffer", 'issue': 'Carga Crítica: Inferência TFLite em execução.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.kt', '.kts'), rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw = 'mlkit'
        if kw in content and "rules =" not in content:
            return f"Fragilidade Cognitiva: O objetivo '{objective}' exige autonomia. Em '{file}', a dependência do ML Kit vincula a 'Orquestração de Inteligência Artificial' a serviços proprietários."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em inteligência JVM."
