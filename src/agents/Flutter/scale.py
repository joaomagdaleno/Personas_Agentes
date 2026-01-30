from persona_base import BaseActivePersona
import os
import re

class ScalePersona(BaseActivePersona):
    """Especialista em arquitetura Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Scale."""
        super().__init__(project_root)
        self.name = "Scale"
        self.emoji = "🏗️"
        self.role = "Scalability Specialist"
        self.mission = "Build on a solid, modular and maintainable foundation."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita modularidade e padrões de projeto."""
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
                        if len(content.split('\n')) > 500:
                            issues.append({'file': rel_path, 'issue': 'Arquivo monolítico detectado. Sugere-se refatoração para modularidade.', 'severity': 'medium', 'context': 'Architecture'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on modularity, design patterns and long-term maintenance.'