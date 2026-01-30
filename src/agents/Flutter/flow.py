from persona_base import BaseActivePersona
import os
import re

class FlowPersona(BaseActivePersona):
    """Especialista em navegação Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Flow."""
        super().__init__(project_root)
        self.name = "Flow"
        self.emoji = "🌊"
        self.role = "Navigation Specialist"
        self.mission = "Ensure seamless and robust user journeys."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita roteamento e transições de tela."""
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
                        if "Navigator.push" in content and "pushNamed" not in content:
                            issues.append({'file': rel_path, 'issue': 'Uso de push direto. Considere rotas nomeadas para escalabilidade.', 'severity': 'low', 'context': 'Navigation Flow'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Expert in GoRouter, AutoRoute and Flutter Navigator.'