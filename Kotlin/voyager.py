from persona_base import BaseActivePersona
import os
import re

class VoyagerPersona(BaseActivePersona):
    """Especialista em inovação Kotlin."""
    def __init__(self, project_root):
        """Inicializa a persona Voyager."""
        super().__init__(project_root)
        self.name = "Voyager"
        self.emoji = "🚀"
        self.role = "Innovation Specialist"
        self.mission = "Keep Android applications updated with latest Kotlin features."
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        """Audita versões de Kotlin e bibliotecas do ecossistema."""
        issues = []
        if not self.project_root: return []
        if os.path.exists(os.path.join(self.project_root, 'build.gradle.kts')):
            with open(os.path.join(self.project_root, 'build.gradle.kts'), 'r') as f:
                content = f.read()
            if "kotlin(" in content and "1.5" in content:
                issues.append({'file': 'build.gradle.kts', 'issue': 'O projeto usa uma versão antiga de Kotlin (1.5). Considere atualizar.', 'severity': 'medium', 'context': 'Innovation'})
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on the bleeding edge of Kotlin and Android development.'