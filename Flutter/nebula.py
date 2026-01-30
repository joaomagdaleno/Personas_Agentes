from persona_base import BaseActivePersona
import os
import re

class NebulaPersona(BaseActivePersona):
    """Especialista em nuvem Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Nebula."""
        super().__init__(project_root)
        self.name = "Nebula"
        self.emoji = "☁️"
        self.role = "Backend Serverless Specialist"
        self.mission = "Architect and implement robust cloud backends."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita integração com Firebase, Supabase ou Appwrite."""
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
                        if "FirebaseFirestore.instance" in content and "instance.settings" not in content:
                            issues.append({'file': rel_path, 'issue': 'Uso direto de instância Firebase sem configurações globais.', 'severity': 'low', 'context': 'Cloud Sync'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on secure and scalable serverless architecture.'