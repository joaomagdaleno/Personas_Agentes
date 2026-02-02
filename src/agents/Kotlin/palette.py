from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class PalettePersona(BaseActivePersona):
    """
    Core: PhD in Design Engineering & Jetpack Compose UI Expert 🎨
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Palette", "🎨", "PhD UX Engineer (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria de design sistêmico JVM integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Estética e UX Android...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"contentDescription\s*=\s*null", 'issue': 'Exclusão: Falta semântica TalkBack.', 'severity': 'high'},
            {'regex': r"Color\(\s*0x[0-9a-fA-F]{8}\s*\)", 'issue': 'Cor Estática: Quebra o Material You.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.kt',), rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw = "content" + "Description = null"
        if kw in content and "rules =" not in content:
            return f"Fragmentação de UX: O objetivo '{objective}' exige inclusão. Em '{file}', a falha semântica impede a 'Orquestração de Inteligência Artificial' de ser universal."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da estética Android."
