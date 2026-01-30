from persona_base import BaseActivePersona
import os
import re

class NexusPersona(BaseActivePersona):
    """Especialista em redes Kotlin."""
    def __init__(self, project_root):
        """Inicializa a persona Nexus."""
        super().__init__(project_root)
        self.name = "Nexus"
        self.emoji = "🌐"
        self.role = "API Integration Specialist"
        self.mission = "Ensure resilient and efficient network communication."
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        """Audita fluxos de dados e chamadas de API (Retrofit/Ktor)."""
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
                        if "@GET" in content or "@POST" in content:
                            if "suspend" not in content:
                                issues.append({'file': rel_path, 'issue': 'Chamada Retrofit detectada sem modificador suspend. Risco de bloqueio de UI.', 'severity': 'high', 'context': 'Networking'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on network layers, data serialization and resiliência.'