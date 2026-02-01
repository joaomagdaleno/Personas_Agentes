from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class HermesPersona(BaseActivePersona):
    """
    Core: PhD in Software Reliability & Android Release Architecture 📦
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Hermes", "📦", "PhD Release Architect (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria de automação de build integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Cadeia de Suprimentos...")
        
        # Sintaxe linear
        rules = [
            {'regex': r'storePassword\s*=\s*["\'].*?["\']', 'issue': 'Vulnerabilidade Crítica: Segredo no Gradle.', 'severity': 'critical'},
            {'regex': r"minifyEnabled\s+false", 'issue': 'Ofuscação Desativada: Binário vulnerável.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.kts', '.gradle'), rules)
        
        duration = time.time() - start_time
        logger.info(f"📦 [{self.name}] Auditoria finalizada em {duration:.4f}s. Pontos: {len(results)}")
        return results

    def _reason_about_objective(self, objective, file, content):
        if "storePassword" in content:
            return f"Risco de Integridade: O objetivo '{objective}' exige artefatos verificados. Em '{file}', segredos expostos permitem ataques à 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião do pipeline Kotlin."
