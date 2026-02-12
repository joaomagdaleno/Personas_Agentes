from src_local.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class ScopePersona(BaseActivePersona):
    """
    Core: PhD in Product Engineering & Technical Roadmap 🔭
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Scope", "🔭", "PhD Product Architect (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria de alinhamento técnico integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Backlog Técnico...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"//\s*TODO", 'issue': 'Débito Técnico: Marcador detectado.', 'severity': 'medium'},
            {'regex': r"debuggable\s+true", 'issue': 'Risco Crítico: App debuggable em produção.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.kt', '.gradle', '.kts'), rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        # O Scope agora delega a auditoria de escopo para o AuditEngine via perform_audit
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da entrega JVM."
