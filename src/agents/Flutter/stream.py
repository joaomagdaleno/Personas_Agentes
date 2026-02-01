from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class StreamPersona(BaseActivePersona):
    """
    Core: PhD in Reactive Systems 📡
    Paridade Técnica: Python -> Flutter.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Stream", "📡", "PhD Reactive Architect", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Fluxos Reativos...")
        
        audit_rules = [
            {'regex': r"StreamController\(", 'issue': 'Vazamento: Controlador sem fechar.', 'severity': 'critical'},
            {'regex': r"async\*", 'issue': 'Concorrência: Gerador assíncrono detectado.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "StreamController" in content and "dispose" not in content:
            return f"Instabilidade Reativa: O objetivo '{objective}' exige vazão de dados contínua. Em '{file}', a má gestão de streams causa travamentos na 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em reatividade."