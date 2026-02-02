from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class FlowPersona(BaseActivePersona):
    """
    Core: PhD in Topology of Information & Reactive Navigation 🌊
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Flow", "🌊", "PhD Navigation Architect (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria de topologia reativa integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Topologia de Fluxo...")
        
        # Sintaxe linear
        rules = [
            {'regex': r'composable\((["\']).*?\1\)', 'issue': 'Fragilidade: Roteamento via String. Use Type-Safe DSL.', 'severity': 'medium'},
            {'regex': r"popUpTo\((?!.*inclusive\s*=\s*true)", 'issue': 'Retenção de Pilha: Risco de navegação circular.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.kt', '.kts'), rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "composable" in content:
            return f"Entropia de Destino: O objetivo '{objective}' exige determinismo. Em '{file}', o uso de rotas dinâmicas não-tipadas ameaça a integridade da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em arquitetura de decisões Kotlin."