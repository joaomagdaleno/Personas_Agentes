from persona_base import BaseActivePersona
import os
import re

class HypePersona(BaseActivePersona):
    """Especialista em visibilidade Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Hype."""
        super().__init__(project_root)
        self.name = "Hype"
        self.emoji = "📣"
        self.role = "Growth Engineering Specialist"
        self.mission = "Optimize acquisition funnel and app discoverability."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita metadados e configurações de Deep Linking."""
        issues = []
        if not self.project_root: return []
        if not os.path.exists(os.path.join(self.project_root, 'README.md')):
            issues.append({'file': 'Raiz', 'issue': 'Falta README.md para documentação pública.', 'severity': 'medium', 'context': 'ASO'})
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on acquisition, deep linking and App Store optimization.'