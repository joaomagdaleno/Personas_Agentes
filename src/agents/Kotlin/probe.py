from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class ProbePersona(BaseActivePersona):
    """
    Core: PhD in Software Forensics & Android Diagnostics 🔍
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Probe", "🔍", "PhD Diagnostics Engineer (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria forense JVM integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Integridade Android...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"catch\s*\(.*?:\s*Exception\)\s*\{\s*\}", 'issue': 'Silenciamento Crítico: Erro ignorado na JVM.', 'severity': 'critical'},
            {'regex': r"Log\.d\(", 'issue': 'Vazamento de Contexto: Log.d em produção.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.kt', '.kts'), rules)
        
        duration = time.time() - start_time
        logger.info(f"🔍 [{self.name}] Auditoria finalizada em {duration:.4f}s. Anomalias: {len(results)}")
        return results

    def _reason_about_objective(self, objective, file, content):
        if "catch" in content and "Exception" in content and "{}" in content:
            return f"Instabilidade Oculta: O objetivo '{objective}' exige resiliência. Em '{file}', o silenciamento de falhas JVM impede a auto-correção da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em diagnósticos Kotlin."
