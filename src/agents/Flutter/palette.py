from persona_base import BaseActivePersona
import os
import re

class PalettePersona(BaseActivePersona):
    """Especialista em design Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Palette."""
        super().__init__(project_root)
        self.name = "Palette"
        self.emoji = "🎨"
        self.role = "UX Specialist"
        self.mission = "Add touches of delight and ensure accessibility."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita acessibilidade e padrões visuais."""
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
                        if "Image.asset" in content and "semanticLabel" not in content:
                            issues.append({'file': rel_path, 'issue': 'Imagem sem semanticLabel detectada (falha de acessibilidade).', 'severity': 'low', 'context': 'UX/A11y'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on intuitive, accessible and pleasant Flutter interfaces.'