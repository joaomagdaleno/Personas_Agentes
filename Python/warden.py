from persona_base import BaseActivePersona
import os
import re

class WardenPersona(BaseActivePersona):
    """Especialista em conformidade Python."""
    def __init__(self, project_root):
        """Inicializa a persona com o diretório raiz do projeto."""
        super().__init__(project_root)
        self.name = "Warden"
        self.emoji = "⚖️"
        self.role = "Compliance Specialist"
        self.mission = "Legal and policy checking."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em conformidade."""
        issues = []
        if not self.project_root: return []
        if not os.path.exists(os.path.join(self.project_root, 'LICENSE')):
            issues.append({'file': 'Raiz', 'issue': 'Arquivo LICENSE ausente. Risco legal.', 'severity': 'high', 'context': 'Warden'})
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'