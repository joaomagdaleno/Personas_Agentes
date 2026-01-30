from persona_base import BaseActivePersona
import os
import re

class WardenPersona(BaseActivePersona):
    """Especialista em compliance Kotlin."""
    def __init__(self, project_root):
        """Inicializa a persona Warden."""
        super().__init__(project_root)
        self.name = "Warden"
        self.emoji = "⚖️"
        self.role = "Compliance Specialist"
        self.mission = "Ensure application adheres to platform policies and legal regulations."
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        """Audita conformidade com Play Store e privacidade."""
        issues = []
        if not self.project_root: return []
        if not os.path.exists(os.path.join(self.project_root, 'LICENSE')):
            issues.append({'file': 'Raiz', 'issue': 'LICENSE não detectada. Risco para projetos open source ou corporativos.', 'severity': 'high', 'context': 'Compliance'})
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on GDPR, data safety and legal operational compliance.'