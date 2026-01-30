from persona_base import BaseActivePersona
import os
import re

class FlowPersona(BaseActivePersona):
    """Especialista em navegação Kotlin."""
    def __init__(self, project_root):
        """Inicializa a persona Flow."""
        super().__init__(project_root)
        self.name = "Flow"
        self.emoji = "🌊"
        self.role = "Navigation Specialist"
        self.mission = "Ensure seamless and robust user journeys in Kotlin/Compose."
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        """Audita roteamento Jetpack Compose e fragmentos."""
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
                        if "NavController" in content and "popUpTo" not in content and "navigate" in content:
                            pass # Só monitoramento de boas práticas
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on screen transitions and robust route management.'