from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class ScalePersona(BaseActivePersona):
    """Core: PhD in Architecture 🏗️"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Scale", "🏗️", "PhD Software Architect", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Acoplamento...")
        
        # Uso de concatenação para evitar que o próprio motor filtre o padrão como seguro
        # Ou use escape para o regex
        kw_global = 'gl' + 'obal'
        audit_rules = [
            {'regex': rf"\b{kw_global}\s+\w+", 'issue': 'Violação: Uso de estado global.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        # O Scale agora delega a auditoria de arquitetura para o AuditEngine via perform_audit
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em arquitetura."
