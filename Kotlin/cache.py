from persona_base import BaseActivePersona
import os
import re

class CachePersona(BaseActivePersona):
    """Especialista em persistência Kotlin."""
    def __init__(self, project_root):
        """Inicializa a persona Cache."""
        super().__init__(project_root)
        self.name = "Cache"
        self.emoji = "🗄️"
        self.role = "Persistence Specialist"
        self.mission = "Implement robust local storage and intelligent caching."
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        """Audita uso de Room, SharedPreferences ou DataStore."""
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
                        if "getSharedPreferences" in content and "edit().apply()" not in content and "edit().commit()" not in content:
                            issues.append({'file': rel_path, 'issue': 'SharedPreferences acessado mas sem chamadas de alteração visíveis.', 'severity': 'low', 'context': 'Cache'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on secure local storage and offline state management.'