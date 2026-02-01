from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class TestifyPersona(BaseActivePersona):
    """
    Core: PhD in Software Verification & JVM Reliability 🧪
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Testify", "🧪", "PhD QA Architect (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria de verificação formal integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Confiabilidade JVM...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"assertEquals\(.*?\s*,\s*true\)", 'issue': 'Asserção Fraca: Use asserções expressivas.', 'severity': 'low'},
            {'regex': r"Thread\.sleep", 'issue': 'Teste Instável: Flakiness detectado via sleep.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.kt',), rules)
        
        duration = time.time() - start_time
        logger.info(f"🧪 [{self.name}] Auditoria finalizada em {duration:.4f}s. Pontos: {len(results)}")
        return results

    def _reason_about_objective(self, objective, file, content):
        if "test" not in content.lower():
            return f"Risco de Regressão: O objetivo '{objective}' exige estabilidade. Em '{file}', a ausência de verificações automatizadas oculta falhas na 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da confiabilidade técnica Kotlin."
