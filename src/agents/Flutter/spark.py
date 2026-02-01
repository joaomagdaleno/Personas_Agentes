from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class SparkPersona(BaseActivePersona):
    """
    Core: PhD in User Engagement ✨
    Paridade Técnica: Python -> Flutter.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Spark", "✨", "PhD Engagement Architect", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Deleite do Usuário...")
        
        audit_rules = [
            {'regex': r"Curves\.linear", 'issue': 'UX: Animação linear detectada. Use curvas premium.', 'severity': 'low'},
            {'regex': r"HapticFeedback", 'issue': 'Sensorial: Feedback tátil ativo.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "AnimationController" not in content and "Widget" in content:
            return f"Interface Árida: O objetivo '{objective}' exige alta percepção de qualidade. Em '{file}', a falta de fluidez visual torna a 'Orquestração de Inteligência Artificial' menos intuitiva para o usuário sênior."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em deleite de interface."