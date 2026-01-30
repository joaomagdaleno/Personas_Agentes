from persona_base import BaseActivePersona
import os
import re

class HypePersona(BaseActivePersona):
    """Especialista em visibilidade Kotlin."""
    def __init__(self, project_root):
        """Inicializa a persona Hype."""
        super().__init__(project_root)
        self.name = "Hype"
        self.emoji = "📣"
        self.role = "Growth Engineering Specialist"
        self.mission = "Optimize Acquisition funnel and Play Store discoverability."
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        """Audita metadados do projeto e README."""
        issues = []
        if not self.project_root: return []
        if not os.path.exists(os.path.join(self.project_root, 'README.md')):
            issues.append({'file': 'Raiz', 'issue': 'Falta README.md no projeto Android/Kotlin.', 'severity': 'medium', 'context': 'ASO'})
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on acquisition funnel and install optimization.'