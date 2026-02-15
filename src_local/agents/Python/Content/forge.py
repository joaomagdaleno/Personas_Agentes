from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class ForgePersona(BaseActivePersona):
    """Core: PhD in Automation ⚒️"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Forge", "⚒️", "PhD Automation Engineer", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Infraestrutura de Automação...")
        
        audit_rules = [
            {'regex': r"pip install", 'issue': 'Aviso: Instalação dinâmica detectada.', 'severity': 'low'},
            {'regex': r"(?<!['\"_])eval\(", 'issue': 'Vulnerabilidade: Execução dinâmica detectada.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        # O Forge agora delega a auditoria de automação para o AuditEngine via perform_audit
        return None

    def validate_code_safety(self, code: str) -> bool:
        """
        Veto Ativo: Recusa código que contenha fragilidades críticas.
        """
        fragilities = ['eval(', 'shell=True', 'exec(']
        for f in fragilities:
            if f in code:
                logger.error(f"🚨 [Forge] VETO: Fragilidade '{f}' detectada no código. Operação abortada por segurança.")
                return False
        return True

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em automação."
