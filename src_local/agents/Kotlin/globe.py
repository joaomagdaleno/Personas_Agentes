from src_local.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class GlobePersona(BaseActivePersona):
    """
    Core: PhD in Computational Linguistics & Android Global UX 🌎
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Globe", "🌎", "PhD Localization Lead (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria semântica JVM integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Localização Android...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"text\s*=\s*['\"][A-Z]", 'issue': 'String Hardcoded: UI fixa detectada.', 'severity': 'high'},
            {'regex': r"layout_marginLeft|layout_marginRight", 'issue': 'Risco RTL: Use marginStart/End.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.kt', '.xml'), rules)
        
        duration = time.time() - start_time
        logger.info(f"🌎 [{self.name}] Auditoria finalizada em {duration:.4f}s. Pontos: {len(results)}")
        return results

    def _reason_about_objective(self, objective, file, content):
        if "text =" in content:
            return f"Barreira Linguística: O objetivo '{objective}' exige escala. Em '{file}', a falta de abstração de strings impede a 'Orquestração de Inteligência Artificial' de atingir maturidade global."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em linguística sistêmica Kotlin."
