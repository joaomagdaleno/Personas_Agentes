from persona_base import BaseActivePersona
import os
import re

class ScopePersona(BaseActivePersona):
    """Especialista em requisitos Python."""
    def __init__(self, project_root):
        """Inicializa a persona com o diretório raiz do projeto."""
        super().__init__(project_root)
        self.name = "Scope"
        self.emoji = "🔭"
        self.role = "Requirements Specialist"
        self.mission = "Technical specs and alignment."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em requisitos."""
        issues = []
        if not self.project_root: return []
        if not os.path.exists(os.path.join(self.project_root, 'README.md')):
            issues.append({'file': 'Raiz', 'issue': ' README.md ausente. Alinhamento de escopo comprometido.', 'severity': 'medium', 'context': 'Scope'})
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'