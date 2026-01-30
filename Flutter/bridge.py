from persona_base import BaseActivePersona
import os
import re

class BridgePersona(BaseActivePersona):
    """Especialista em integrações nativas Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Bridge."""
        super().__init__(project_root)
        self.name = "Bridge"
        self.emoji = "🌉"
        self.role = "Native Integration Specialist"
        self.mission = "Connect Flutter with Android/iOS native code."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita chamadas de MethodChannel e código nativo."""
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
                        if "MethodChannel" in content and "try" not in content:
                            issues.append({'file': rel_path, 'issue': 'MethodChannel sem proteção try-catch detectado.', 'severity': 'high', 'context': 'Native Bridge'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Expert in Flutter Method Channels and native glue code.'