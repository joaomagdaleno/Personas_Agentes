from persona_base import BaseActivePersona
import os
import re

class NebulaPersona(BaseActivePersona):
    """Especialista em nuvem Kotlin."""
    def __init__(self, project_root):
        """Inicializa a persona Nebula."""
        super().__init__(project_root)
        self.name = "Nebula"
        self.emoji = "☁️"
        self.role = "Backend Serverless Specialist"
        self.mission = "Implement secure, scalable backends for Kotlin apps."
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        """Audita integrações com cloud services."""
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
                        if "FirebaseFirestore" in content and "setPersistenceEnabled" not in content:
                            pass # Monitoramento de sincronização offline
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on Firebase, Supabase and scalable cloud backends.'