from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class ScribePersona(BaseActivePersona):
    """
    Core: PhD in Technical Communication & Knowledge Management ✍️
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Scribe", "✍️", "PhD Technical Writer (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria de clareza semântica integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Documentação JVM...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"(class|fun)\s+\w+\s+\{(?![^{]*/\*\*)", 'issue': 'Vácuo Documental: Falta KDoc público.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.kt', '.kts'), rules)
        
        duration = time.time() - start_time
        logger.info(f"✍️ [{self.name}] Auditoria finalizada em {duration:.4f}s. Pontos: {len(results)}")
        return results

    def _reason_about_objective(self, objective, file, content):
        if "class" in content and "/**" not in content:
            return f"Déficit de Explicabilidade: O objetivo '{objective}' exige transparência de lógica. Em '{file}', a ausência de KDoc isola a 'Orquestração de Inteligência Artificial' de sua base de conhecimento."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da semântica técnica Kotlin."
