from persona_base import BaseActivePersona
import os
import re

class TestifyPersona(BaseActivePersona):
    """Especialista em testes Python."""
    def __init__(self, project_root):
        """Inicializa a persona com o diretório raiz do projeto."""
        super().__init__(project_root)
        self.name = "Testify"
        self.emoji = "🧪"
        self.role = "Testing Specialist"
        self.mission = "Unit and integration reliability."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em testes."""
        issues = []
        if not self.project_root: return []
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build', 'node_modules', '__pycache__']]
            for file in files:
                if file.endswith('.py') and 'test' not in file.lower():
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    test_file = file.replace('.py', '_test.py')
                    if not os.path.exists(os.path.join(root, test_file)):
                        issues.append({'file': rel_path, 'issue': 'Arquivo de código sem arquivo de teste correspondente.', 'severity': 'medium', 'context': 'Testify'})
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'