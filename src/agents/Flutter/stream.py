from persona_base import BaseActivePersona
import os
import re

class StreamPersona(BaseActivePersona):
    """Especialista em tempo real Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Stream."""
        super().__init__(project_root)
        self.name = "Stream"
        self.emoji = "📡"
        self.role = "Real-Time Specialist"
        self.mission = "Ensure Flutter applications are reactive and synchronized."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita fluxos de dados reativos e WebSockets."""
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
                        if "StreamController" in content and "dispose" not in content:
                            issues.append({'file': rel_path, 'issue': 'StreamController possivelmente não fechado no dispose.', 'severity': 'high', 'context': 'Resource Leak'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on real-time communication and efficient data synchronization.'