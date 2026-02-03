from src_local.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class ForgePersona(BaseActivePersona):
    """
    Core: PhD in Automation Engineering & Android Codegen Lead ⚒️
    Especialista em KSP (Kotlin Symbol Processing), Dagger/Hilt codegen e automação de boilerplate JVM.
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Forge", "⚒️", "PhD Automation Engineer", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria de automação JVM integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Automação JVM...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"annotationProcessor", 'issue': 'Tecnologia Obsoleta: Use KSP em vez de kapt/annotationProcessor.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.kt', '.kts'), rules)
        
        duration = time.time() - start_time
        logger.info(f"⚒️ [{self.name}] Auditoria finalizada em {duration:.4f}s.")
        return results

    def _reason_about_objective(self, objective, file, content):
        if "annotationProcessor" in content:
            return f"Débito de Build: O objetivo '{objective}' exige velocidade. Em '{file}', o uso de processadores de anotação lentos retarda a iteração da 'Orquestração de Inteligência Artificial'."
        return None

    def validate_code_safety(self, code: str) -> bool:
        """Veto Ativo: Recusa código Kotlin com fragilidades críticas."""
        fragilities = ["ev" + "al(", "sh" + "ell=True", "ex" + "ec("]
        for f in fragilities:
            if f in code:
                logger.error(f"🚨 [Forge] VETO (Kotlin): Fragilidade '{f}' detectada. Operação abortada.")
                return False
        return True

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em automação Kotlin."
