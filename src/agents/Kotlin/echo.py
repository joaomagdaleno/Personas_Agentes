from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class EchoPersona(BaseActivePersona):
    """
    Core: PhD in System Observability & Real-time Telemetry (Kotlin) 🗣️
    Especialista em Logcat, Timber e monitoramento de sistema JVM.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Echo", "🗣️", "PhD Observability Engineer", "Kotlin"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Visibilidade e Rastreabilidade Kotlin...")
        
        audit_rules = [
            {'regex': r"println\(", 'issue': 'Aviso: Uso de println() detectado. Use Timber ou Log.', 'severity': 'medium'},
            {'regex': r"catch\s*\(.*?\)\s*\{\s*\}", 'issue': 'Cegueira: Exceção silenciada (empty catch).', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.kt', '.kts'), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "println(" in content:
            return f"Cegueira Operacional: O objetivo '{objective}' exige diagnóstico. Em '{file}', o uso de println() impede a gestão da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em observabilidade Android."