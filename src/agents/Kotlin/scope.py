from persona_base import BaseActivePersona
import os
import re

class ScopePersona(BaseActivePersona):
    """Especialista em requisitos Kotlin."""
    def __init__(self, project_root):
        """Inicializa a persona Scope."""
        super().__init__(project_root)
        self.name = "Scope"
        self.emoji = "🔭"
        self.role = "Product Specialist"
        self.mission = "Align engineering efforts with user needs and business goals."
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        """Audita alinhamento técnico com as especificações."""
        issues = []
        if not self.project_root: return []
        if not os.path.exists(os.path.join(self.project_root, 'README.md')):
            issues.append({'file': 'Raiz', 'issue': 'Projeto Android sem README.md detectado.', 'severity': 'medium', 'context': 'Product Alignment'})
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on technical scope management and requirement translation.'