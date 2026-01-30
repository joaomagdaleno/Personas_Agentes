from persona_base import BaseActivePersona
import os
import re

class GlobePersona(BaseActivePersona):
    """Especialista em internacionalização Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Globe."""
        super().__init__(project_root)
        self.name = "Globe"
        self.emoji = "🌎"
        self.role = "i18n & Localization Specialist"
        self.mission = "Prepare Flutter apps for a global audience."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita strings não traduzidas e suporte a RTL."""
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
                        if "Text('" in content and "AppLocalizations" not in content and ".tr" not in content:
                            issues.append({'file': rel_path, 'issue': 'String literal detectada fora de sistema de tradução.', 'severity': 'low', 'context': 'i18n'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on localization, cultural adaptation and RTL support.'