from src_local.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class NexusPersona(BaseActivePersona):
    """
    Core: PhD in Distributed Systems & API Resiliency 🌐
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Nexus", "🌐", "PhD Network Architect (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria de conectividade JVM integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Resiliência de Rede...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"GlobalScope\.launch", 'issue': 'Quebra de Concorrência: Uso de GlobalScope detectado.', 'severity': 'high'},
            {'regex': r"allowMainThreadQueries\(\)", 'issue': 'Violação Crítica: I/O bloqueante na UI thread.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.kt', '.kts'), rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "GlobalScope" in content:
            return f"Risco de Inconsistência: O objetivo '{objective}' exige gestão de escopo. Em '{file}', o uso de GlobalScope impede o controle de cancelamento da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da conectividade Kotlin."
