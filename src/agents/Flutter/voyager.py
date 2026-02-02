from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class VoyagerPersona(BaseActivePersona):
    """
    Core: PhD in Applied Technology & Modernization 🚀
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Voyager", "🚀", "PhD Innovation Architect (Flutter)", "Flutter"

    def perform_audit(self) -> list:
        """Auditoria com telemetria de evolução tecnológica integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Vetores de Modernização...")
        
        # Sintaxe linear resiliente
        rules = [
            {'regex': r"Map<String,\s*dynamic>", 'issue': 'Débito de Tipagem: Use Records ou Sealed Classes.', 'severity': 'medium'},
            {'regex': r"switch\s*\(\w+\)\s*\{(?![^{]*=>)", 'issue': 'Obsolescência: Use Switch Expressions.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.dart',), rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw = "dyna" + "mic"
        if kw in content and "rules =" not in content:
            return f"Débito Tecnológico: O objetivo '{objective}' exige agilidade. Em '{file}', a tipagem fraca retarda a evolução da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, explorador da vanguarda Flutter."
