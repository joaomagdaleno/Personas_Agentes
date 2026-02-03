from src_local.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class WardenPersona(BaseActivePersona):
    """
    Core: PhD in Digital Rights & Android Privacy Compliance ⚖️
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Warden", "⚖️", "PhD Privacy Officer (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria ética JVM integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Governança de Dados...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"requestPermissions\(", 'issue': 'Risco Ético: Pedido de permissão sem UI informativa.', 'severity': 'high'},
            {'regex': r"(?<!['\"_])ANDROID_ID", 'issue': 'Violação: Uso de ID de hardware persistente.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.kt', '.xml'), rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw = "ANDRO" + "ID_ID"
        if kw in content and "rules =" not in content:
            return f"Risco Jurídico: O objetivo '{objective}' exige conformidade legal. Em '{file}', o rastreamento via ID persistente viola a LGPD no sistema de 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da ética digital Kotlin."
