from persona_base import BaseActivePersona
import os
import re

class GlobePersona(BaseActivePersona):
    """Especialista em internacionalização Kotlin."""
    def __init__(self, project_root):
        """Inicializa a persona Globe."""
        super().__init__(project_root)
        self.name = "Globe"
        self.emoji = "🌎"
        self.role = "i18n Specialist"
        self.mission = "Ensure Kotlin apps are ready for a global audience."
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        """Audita strings hardcoded no Kotlin e XML."""
        issues = []
        if not self.project_root: return []
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build']]
            for file in files:
                if file.endswith(('.kt', '.xml')):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    try:
                        with open(os.path.join(root, file), 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                        if "getString(" not in content and "R.string." not in content and 'text = "' in content:
                            issues.append({'file': rel_path, 'issue': 'Texto hardcoded detectado fora do strings.xml.', 'severity': 'low', 'context': 'i18n'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on cultural adaptations and global accessibility.'