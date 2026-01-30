from persona_base import BaseActivePersona
import os
import re

class NeuralPersona(BaseActivePersona):
    """Especialista em inteligência Kotlin."""
    def __init__(self, project_root):
        """Inicializa a persona Neural."""
        super().__init__(project_root)
        self.name = "Neural"
        self.emoji = "🧠"
        self.role = "AI Specialist"
        self.mission = "Integrate AI features and LLMs into Kotlin applications."
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        """Audita chamadas de API de IA no Android."""
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
                        if "apiKey" in content.lower() and ("openai" in content.lower() or "gemini" in content.lower()):
                            issues.append({'file': rel_path, 'issue': 'Possível chave de API exposta no código Kotlin.', 'severity': 'high', 'context': 'Security/AI'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on merging traditional engineering with intelligent systems.'