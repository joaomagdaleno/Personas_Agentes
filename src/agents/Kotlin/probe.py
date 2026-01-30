from persona_base import BaseActivePersona
import os
import re

class ProbePersona(BaseActivePersona):
    """Especialista em diagnóstico Kotlin."""
    def __init__(self, project_root):
        """Inicializa a persona Probe."""
        super().__init__(project_root)
        self.name = "Probe"
        self.emoji = "🕵️"
        self.role = "Diagnostics Specialist"
        self.mission = "Diagnose complex bugs and memory leaks in Android."
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        """Audita logs de erro e pontos de falha no Kotlin."""
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
                        if "catch(e: Exception)" in content and "e.printStackTrace()" in content:
                            issues.append({'file': rel_path, 'issue': 'printStackTrace detectado. Recomenda-se tratamento de erro estruturado.', 'severity': 'medium', 'context': 'Diagnostics'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on identifying and solving CPU bottlenecks and state inconsistencies.'