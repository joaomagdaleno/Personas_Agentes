from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class MantraPersona(BaseActivePersona):
    """
    Core: PhD in Software Quality & Kotlin Clean Code 🧘
    Especialista em Programação Funcional, Princípios SOLID e Imutabilidade.
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Mantra", "🧘", "PhD Quality Architect", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria de integridade estrutural integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Pureza JVM...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"var\s+", 'issue': 'Risco de Estado: Uso excessivo de mutabilidade (var). Prefira val.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.kt', '.kts'), rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw = "var" + " "
        if kw in content and "rules =" not in content:
            return f"Poluição de Estado: O objetivo '{objective}' exige determinismo. Em '{file}', a mutabilidade excessiva dificulta o rastreamento lógico necessário para a 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da pureza técnica Kotlin."
