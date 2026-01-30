from persona_base import BaseActivePersona
import os
import re

class BoltPersona(BaseActivePersona):
    """Especialista em performance Flutter do Personas Agentes."""
    def __init__(self, project_root):
        """Inicializa a persona Bolt."""
        super().__init__(project_root)
        self.name = "Bolt"
        self.emoji = "⚡"
        self.role = "Performance Specialist"
        self.mission = "Optimize execution speed and UI smoothness."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita problemas de performance no código Flutter."""
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
                        if "setState" in content and "for " in content:
                            issues.append({'file': rel_path, 'issue': 'Potencial jank: setState detectado dentro de loop.', 'severity': 'high', 'context': 'Performance'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on Flutter performance and smoothness.'