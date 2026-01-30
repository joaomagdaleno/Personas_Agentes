from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class WardenPersona(BaseActivePersona):
    """Especialista em conformidade e legal Python do Personas Agentes."""
    
    def __init__(self, project_root):
        """Inicializa a persona Warden."""
        super().__init__(project_root)
        self.name = "Warden"
        self.emoji = "⚖️"
        self.role = "Compliance Specialist"
        self.mission = "Audit legal documents, policies and regulatory compliance."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em documentos legais e conformidade."""
        issues = []
        if not self.project_root:
            return []
            
        # Verifica presença de licença
        if not os.path.exists(os.path.join(self.project_root, 'LICENSE')) and \
           not os.path.exists(os.path.join(self.project_root, 'LICENSE.txt')):
            issues.append({
                'file': 'Raiz', 
                'issue': 'Arquivo LICENSE ausente. Risco legal e de conformidade detectado.', 
                'severity': 'high', 
                'context': 'Legal'
            })
            
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'