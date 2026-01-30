from persona_base import BaseActivePersona
import os
import re

class NexusPersona(BaseActivePersona):
    """Especialista em redes Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Nexus."""
        super().__init__(project_root)
        self.name = "Nexus"
        self.emoji = "🌐"
        self.role = "API Integration Specialist"
        self.mission = "Ensure efficient and resilient network communication."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita fluxos de dados, conectividade e resiliência."""
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
                        if "http.get" in content or "dio.get" in content:
                            if "try" not in content:
                                issues.append({'file': rel_path, 'issue': 'Chamada de rede desprotegida (falta try-catch).', 'severity': 'high', 'context': 'Resiliency'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on network layers, data serialization and connectivity logic.'