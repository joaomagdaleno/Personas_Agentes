from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class SparkPersona(BaseActivePersona):
    """
    Core: PhD in UX Psychology & Android Delight ✨
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Spark", "✨", "PhD Engagement Architect (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria de deleite visual JVM integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Elementos de Imersão...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"animate.*AsState\((?!.*animationSpec)", 'issue': 'Movimento Padrão: Falta especificação de animação.', 'severity': 'low'},
            {'regex': r"performHapticFeedback", 'issue': 'Engajamento Tátil: Feedback hárptico detectado.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.kt',), rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw = "anim" + "ate"
        if kw not in content and "Composable" in content and "rules =" not in content:
            return f"Interface Estática: O objetivo '{objective}' exige engajamento. Em '{file}', a ausência de feedback visual premium torna a 'Orquestração de Inteligência Artificial' menos intuitiva."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em psicologia da interface Kotlin."
