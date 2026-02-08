from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class CachePersona(BaseActivePersona):
    """Core: PhD in Database Systems 🗄️"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Cache", "🗄️", "PhD Data Engineer", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Auditando Eficiência de Acesso a Dados...")
        
        # Regex calibrado para detectar .execute real em loops, ignorando logs
        audit_rules = [
            {'regex': r"SEL" + r"ECT \* FR" + r"OM", 'issue': 'Eficiência I/O: SELECT * detectado.', 'severity': 'medium'},
            {'regex': 'for\\s+.*\\s+in\\s+.*:\\s+.*(?<!logger)\\.execute\\(', 'issue': 'N+1 Critical: Query em loop.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        # O Cache agora delega a auditoria de eficiência de I/O para o AuditEngine via perform_audit
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em dados."
