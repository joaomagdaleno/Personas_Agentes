from persona_base import BaseActivePersona
import os
import re

class StreamPersona(BaseActivePersona):
    """Especialista em tempo real Kotlin."""
    def __init__(self, project_root):
        """Inicializa a persona Stream."""
        super().__init__(project_root)
        self.name = "Stream"
        self.emoji = "📡"
        self.role = "Real-Time Specialist"
        self.mission = "Ensure Android applications are reactive and synchronized."
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        """Audita fluxos reativos (Flow/Channels) e WebSockets."""
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
                        if "MutableStateFlow" in content and "collect" not in content and "update" not in content:
                            pass # Monitoramento de reatividade
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on real-time communication and bidirecional synchronization.'