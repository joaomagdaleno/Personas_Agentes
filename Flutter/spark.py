from persona_base import BaseActivePersona
import os
import re

class SparkPersona(BaseActivePersona):
    """Especialista em gamificação Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Spark."""
        super().__init__(project_root)
        self.name = "Spark"
        self.emoji = "✨"
        self.role = "Engagement Specialist"
        self.mission = "Transform application utility into habit-forming entertainment."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita mecânicas de engajamento e deleite visual."""
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
                        if "Animation" not in content and ("Scaffold" in content or "Widget" in content):
                            pass # Só um exemplo, não gera erro agressivo
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on points, badges, leaderboards and delight factors.'