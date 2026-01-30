from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class ScopePersona(BaseActivePersona):
    """Especialista em requisitos Python do Personas Agentes.
    Foca em especificações técnicas e alinhamento de escopo.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Scope."""
        super().__init__(project_root)
        self.name = "Scope"
        self.emoji = "🔭"
        self.role = "Requirements Specialist"
        self.mission = "Maintain technical specs and scope alignment."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em alinhamento de escopo e documentação base."""
        issues = []
        if not self.project_root:
            return []
            
        if not os.path.exists(os.path.join(self.project_root, 'README.md')):
            issues.append({
                'file': 'Raiz', 
                'issue': 'README.md ausente. Alinhamento de escopo e visão geral comprometidos.', 
                'severity': 'medium', 
                'context': 'Requirements'
            })
            
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'