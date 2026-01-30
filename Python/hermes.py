from persona_base import BaseActivePersona
import os
import re

class HermesPersona(BaseActivePersona):
    """Especialista em DevOps Python."""
    def __init__(self, project_root):
        """Inicializa a persona com o diretório raiz do projeto."""
        super().__init__(project_root)
        self.name = "Hermes"
        self.emoji = "📦"
        self.role = "DevOps & Delivery Specialist"
        self.mission = "CI/CD and packaging."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em DevOps."""
        issues = []
        if not self.project_root: return []
        if not os.path.exists(os.path.join(self.project_root, 'requirements.txt')) and not os.path.exists(os.path.join(self.project_root, 'pyproject.toml')):
            issues.append({'file': 'Raiz', 'issue': 'Falta arquivo de dependências (requirements.txt ou pyproject.toml).', 'severity': 'high', 'context': 'Hermes'})
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'