from src_local.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class ScalePersona(BaseActivePersona):
    """
    Core: PhD in Software Architecture & Android Scalability 🏗️
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Scale", "🏗️", "PhD Software Architect (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria de modularidade JVM integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Arquitetura Android...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"class\s+\w+Activity", 'issue': 'Acoplamento: Lógica de negócio na UI.', 'severity': 'high'},
            {'regex': r"\.internal\.", 'issue': 'Encapsulamento: Dependência interna exposta.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.kt', '.kts'), rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw1, kw2 = 'Activity', 'ViewModel'
        if kw1 in content and kw2 not in content and "rules =" not in content:
            return f"Fragilidade Estrutural: O objetivo '{objective}' exige Clean Architecture. Em '{file}', o acoplamento de responsabilidades impede o teste isolado da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em arquitetura JVM."
