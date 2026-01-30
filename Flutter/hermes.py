from persona_base import BaseActivePersona
import os
import re

class HermesPersona(BaseActivePersona):
    """Especialista em DevOps Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Hermes."""
        super().__init__(project_root)
        self.name = "Hermes"
        self.emoji = "📦"
        self.role = "DevOps & Delivery Specialist"
        self.mission = "Automate CI/CD and build configurations."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita scripts de build, pubspec e CI."""
        issues = []
        if not self.project_root: return []
        if not os.path.exists(os.path.join(self.project_root, 'pubspec.yaml')):
            issues.append({'file': 'Raiz', 'issue': 'Arquivo pubspec.yaml não encontrado.', 'severity': 'high', 'context': 'DevOps'})
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on optimizing the path to production and build precision.'