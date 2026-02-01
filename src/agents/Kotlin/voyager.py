from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class VoyagerPersona(BaseActivePersona):
    """
    Core: PhD in Applied Systems & Kotlin Innovation 🚀
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Voyager", "🚀", "PhD Innovation Architect (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria de inovação tecnológica JVM integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Vetores de Evolução...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"sealed\s+class", 'issue': 'Oportunidade: Use Sealed Interfaces no Kotlin moderno.', 'severity': 'low'},
            {'regex': r"findViewById", 'issue': 'Tecnologia Obsoleta: Migre para Compose ou ViewBinding.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.kt', '.kts'), rules)
        
        duration = time.time() - start_time
        logger.info(f"🚀 [{self.name}] Auditoria finalizada em {duration:.4f}s. Pontos: {len(results)}")
        return results

    def _reason_about_objective(self, objective, file, content):
        if "findViewById" in content:
            return f"Débito de Modernidade: O objetivo '{objective}' exige velocidade de desenvolvimento. Em '{file}', o uso de padrões imperativos limita a agilidade da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em inovação Kotlin."
