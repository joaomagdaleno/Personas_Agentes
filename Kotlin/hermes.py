from persona_base import BaseActivePersona
import os
import re

class HermesPersona(BaseActivePersona):
    """Especialista em DevOps Kotlin."""
    def __init__(self, project_root):
        """Inicializa a persona Hermes."""
        super().__init__(project_root)
        self.name = "Hermes"
        self.emoji = "📦"
        self.role = "DevOps Specialist"
        self.mission = "Automate path to production and build configurations."
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        """Audita arquivos build.gradle e configurações de CI."""
        issues = []
        if not self.project_root: return []
        if not os.path.exists(os.path.join(self.project_root, 'build.gradle')) and not os.path.exists(os.path.join(self.project_root, 'build.gradle.kts')):
            issues.append({'file': 'Raiz', 'issue': 'Arquivo build.gradle não encontrado.', 'severity': 'high', 'context': 'DevOps'})
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on optimizing Gradle builds and release pipelines.'