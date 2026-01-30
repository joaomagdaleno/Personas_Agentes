from persona_base import BaseActivePersona
import os
import re

class ScribePersona(BaseActivePersona):
    """Especialista em documentação Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Scribe."""
        super().__init__(project_root)
        self.name = "Scribe"
        self.emoji = "✍️"
        self.role = "Knowledge Specialist"
        self.mission = "Ensure the codebase is self-explanatory and accessible."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita docstrings e clareza do código Dart."""
        issues = []
        if not self.project_root: return []
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build', '.dart_tool']]
            for file in files:
                if file.endswith('.dart'):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    try:
                        with open(os.path.join(root, file), 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                        if "class " in content and "///" not in content:
                            issues.append({'file': rel_path, 'issue': 'Classe pública sem documentação DartDoc.', 'severity': 'low', 'context': 'Documentation'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on capturing tribal knowledge and standardizing technical docs.'