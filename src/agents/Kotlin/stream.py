from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class StreamPersona(BaseActivePersona):
    """
    Core: PhD in Reactive Systems & Asynchronous Flow 📡
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Stream", "📡", "PhD Reactive Architect (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria de concorrência estruturada integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Reatividade JVM...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"callbackFlow\s*\{(?!.*awaitClose)", 'issue': 'Vazamento Crítico: Flow sem awaitClose.', 'severity': 'critical'},
            {'regex': r"MutableStateFlow", 'issue': 'Gestão de Estado: Verifique conformidade de coleta.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.kt',), rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw1, kw2 = "callback" + "Flow", "await" + "Close"
        if kw1 in content and kw2 not in content and "rules =" not in content:
            return f"Instabilidade Sistêmica: O objetivo '{objective}' exige resiliência. Em '{file}', o vazamento de listeners paralisa o sistema de 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em concorrência estruturada Kotlin."
