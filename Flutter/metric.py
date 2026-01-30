from persona_base import BaseActivePersona
import os
import re

class MetricPersona(BaseActivePersona):
    """Especialista em telemetria Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Metric."""
        super().__init__(project_root)
        self.name = "Metric"
        self.emoji = "📊"
        self.role = "Analytics Specialist"
        self.mission = "Transform application usage into useful data."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita implementação de logs e trackers."""
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
                        if "print(" in content and "log(" not in content:
                            issues.append({'file': rel_path, 'issue': 'Uso de print() detectado em vez de logger profissional.', 'severity': 'low', 'context': 'Telemetry'})
                    except Exception: continue
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on accurate, private and useful behavior tracking.'