from persona_base import BaseActivePersona
import os
import re

class BoltPersona(BaseActivePersona):
    """Especialista em performance Kotlin."""
    def __init__(self, project_root):
        """Inicializa a persona Bolt."""
        super().__init__(project_root)
        self.name = "Bolt"
        self.emoji = "⚡"
        self.role = "Performance Specialist"
        self.mission = "Identify and implement performance improvements in Kotlin."
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        """Audita gargalos de performance e loops ineficientes."""
        issues = []
        if not self.project_root: return []
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build']]
            for file in files:
                if file.endswith('.kt'):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    try:
                        with open(os.path.join(root, file), 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                        if "while(true)" in content or "for(" in content and "Thread.sleep" in content:
                            issues.append({'file': rel_path, 'issue': 'Potencial bloqueio de thread detectado.', 'severity': 'high', 'context': 'Performance'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on Android/Kotlin performance and responsiveness.'