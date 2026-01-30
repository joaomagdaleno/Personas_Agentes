from persona_base import BaseActivePersona
import os
import re

class VoyagerPersona(BaseActivePersona):
    """Especialista em novas tecnologias Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Voyager."""
        super().__init__(project_root)
        self.name = "Voyager"
        self.emoji = "🚀"
        self.role = "Innovation Specialist"
        self.mission = "Keep Flutter applications updated with bleeding-edge technologies."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita dívida tecnológica e oportunidades de upgrade."""
        issues = []
        if not self.project_root: return []
        if os.path.exists(os.path.join(self.project_root, 'pubspec.yaml')):
            with open(os.path.join(self.project_root, 'pubspec.yaml'), 'r') as f:
                content = f.read()
            if "sdk: '>=2." in content:
                issues.append({'file': 'pubspec.yaml', 'issue': 'O projeto ainda usa Dart 2.x. Considere migrar para Dart 3.', 'severity': 'medium', 'context': 'Innovation'})
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on the bleeding edge of Flutter and Dart.'