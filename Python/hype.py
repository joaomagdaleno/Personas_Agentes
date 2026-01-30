from persona_base import BaseActivePersona
import os
import re

class HypePersona(BaseActivePersona):
    """Especialista em visibilidade Python."""
    def __init__(self, project_root):
        """Inicializa a persona com o diretório raiz do projeto."""
        super().__init__(project_root)
        self.name = "Hype"
        self.emoji = "📣"
        self.role = "Marketing & Growth Specialist"
        self.mission = "Metadata and visibility."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em metadados."""
        issues = []
        if not self.project_root: return []
        if not os.path.exists(os.path.join(self.project_root, 'README.md')):
            issues.append({'file': 'Raiz', 'issue': 'Projeto sem README.md. Visibilidade crítica.', 'severity': 'high', 'context': 'Hype'})
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'