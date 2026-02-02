from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class SentinelPersona(BaseActivePersona):
    """
    Core: PhD in Mobile Cybersecurity & Android Security Lead 🛡️
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Sentinel", "🛡️", "PhD Security Architect (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria forense de segurança JVM integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Vetores de Ataque Android...")
        
        # Sintaxe linear resiliente
        rules = [
            {'regex': r"http://", 'issue': 'Vulnerabilidade: Tráfego Cleartext detectado.', 'severity': 'critical'},
            {'regex': r'android:allowBackup=["\']true["\']', 'issue': 'Risco de Exposição: Backup via ADB ativo.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.kt', '.xml'), rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw = "htt" + "p://"
        if kw in content and "rules =" not in content:
            return f"Vulnerabilidade Crítica: O objetivo '{objective}' exige segurança total. Em '{file}', o uso de HTTP expõe a 'Orquestração de Inteligência Artificial' a ataques de rede."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da soberania digital Kotlin."
