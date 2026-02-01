from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class SentinelPersona(BaseActivePersona):
    """
    Core: PhD in Mobile Cybersecurity 🛡️
    Paridade Técnica: Python -> Flutter.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Sentinel", "🛡️", "PhD Security Architect", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Segurança Mobile...")
        
        audit_rules = [
            {'regex': r"http://", 'issue': 'Vulnerabilidade: Tráfego Cleartext detectado.', 'severity': 'critical'},
            {'regex': r'allowBackup=["\']true["\']', 'issue': 'Risco: Backup de dados via ADB habilitado.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.dart', '.xml'), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "http://" in content:
            return f"Vulnerabilidade Crítica: O objetivo '{objective}' exige segurança de transporte. Em '{file}', o uso de HTTP permite ataques MITM que comprometem a soberania da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da integridade Flutter."
