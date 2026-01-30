from persona_base import BaseActivePersona
import os
import re

class WardenPersona(BaseActivePersona):
    """Especialista em compliance Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Warden."""
        super().__init__(project_root)
        self.name = "Warden"
        self.emoji = "⚖️"
        self.role = "Compliance Specialist"
        self.mission = "Ensure adherence to laws, regulations and platform policies."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita políticas de privacidade e termos legais."""
        issues = []
        if not self.project_root: return []
        if not os.path.exists(os.path.join(self.project_root, 'LICENSE')):
            issues.append({'file': 'Raiz', 'issue': 'Falta o arquivo de LICENSE para conformidade legal.', 'severity': 'high', 'context': 'Legal/Policy'})
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on GDPR, LGPD and protecting the project from liability.'