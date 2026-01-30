from persona_base import BaseActivePersona
import os
import re

class EchoPersona(BaseActivePersona):
    """Especialista em feedback Kotlin."""
    def __init__(self, project_root):
        """Inicializa a persona Echo."""
        super().__init__(project_root)
        self.name = "Echo"
        self.emoji = "🗣️"
        self.role = "Customer Success Specialist"
        self.mission = "Build channels for feedback and automate changelogs."
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        """Audita loops de feedback e diálogos no Android/Kotlin."""
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
                        if "Toast.makeText" in content and ".show()" not in content:
                            issues.append({'file': rel_path, 'issue': 'Toast instanciado mas não exibido (falta .show()).', 'severity': 'medium', 'context': 'UX Feedback'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on turning user frustration into technical tasks.'