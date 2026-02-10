from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class BridgePersona(BaseActivePersona):
    """Core: PhD in Distributed Systems 🌉"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Bridge", "🌉", "PhD Systems Architect", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Camadas de Interoperabilidade...")
        
        audit_rules = [
            {'regex': r'subprocess\.run\(.*shell=True', 'issue': 'Vulnerabilidade: Shell Injection.', 'severity': 'critical'},
            {'regex': r'os\.system\(', 'issue': 'Obsolescência: Use subprocess.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        # O Bridge delega a detecção de risco para o AuditEngine via perform_audit
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em integração."
