from src.agents.base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class WardenPersona(BaseActivePersona):
    """
    Especialista em compliance e integridade legal.
    Garante que o projeto respeite licenças e normas de segurança de dados.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Warden"
        self.emoji = "⚖️"
        self.role = "Compliance Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Verifica documentos legais e conformidade de dependências."""
        logger.info(f"[{self.name}] Validando conformidade legal...")
        
        issues = []
        if not os.path.exists(os.path.join(self.project_root, 'LICENSE')):
            issues.append({
                'file': 'root',
                'issue': 'Documento de LICENSE ausente. Risco legal para o projeto.',
                'severity': 'high',
                'context': self.name
            })
            
        return issues

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Protect the project from legal risks and ensure ethical compliance.'
