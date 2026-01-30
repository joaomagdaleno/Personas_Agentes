from persona_base import BaseActivePersona
import os
import re

class ProbePersona(BaseActivePersona):
    """Especialista em diagnóstico Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Probe."""
        super().__init__(project_root)
        self.name = "Probe"
        self.emoji = "🧪"
        self.role = "Diagnostics Specialist"
        self.mission = "Diagnose complex bugs and memory leaks."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita logs de erro e pontos de falha silenciosa."""
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
                        if "catch (e)" in content and "print(e)" in content:
                            issues.append({'file': rel_path, 'issue': 'Captura de erro fraca detectada (print básico em catch).', 'severity': 'medium', 'context': 'Diagnostics'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Act as a detective inside the Flutter application.'