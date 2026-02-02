from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class NebulaPersona(BaseActivePersona):
    """
    Core: PhD in Distributed Computing & Android Cloud Lead ☁️
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Nebula", "☁️", "PhD Cloud Architect (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria cloud JVM integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Infraestrutura Android Cloud...")
        
        # Sintaxe linear
        rules = [
            {'regex': r"FirebaseFirestore\.getInstance", 'issue': 'Risco de Acoplamento: Firestore síncrono.', 'severity': 'medium'},
            {'regex': r"AK" + r"IA[0-9A-Z]{16}", 'issue': 'Vazamento Crítico: Credencial AWS exposta.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.kt', '.xml', '.json'), rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw = "AK" + "IA"
        if kw in content and "rules =" not in content:
            return f"Risco de Soberania: O objetivo '{objective}' exige infraestrutura protegida. Em '{file}', a exposição de segredos cloud invalida a autonomia da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em arquitetura cloud Kotlin."
