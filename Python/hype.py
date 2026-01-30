from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class HypePersona(BaseActivePersona):
    """Especialista em visibilidade e metadados Python do Personas Agentes."""
    
    def __init__(self, project_root):
        """Inicializa a persona Hype."""
        super().__init__(project_root)
        self.name = "Hype"
        self.emoji = "📣"
        self.role = "Marketing & Growth Specialist"
        self.mission = "Enhance project metadata and market visibility."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em metadados e documentação de alto nível."""
        issues = []
        if not self.project_root:
            return []
            
        if not os.path.exists(os.path.join(self.project_root, 'README.md')):
            issues.append({
                'file': 'Raiz', 
                'issue': 'Projeto sem README.md. Visibilidade e documentação crítica ausente.', 
                'severity': 'high', 
                'context': 'Visibility'
            })
            
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'