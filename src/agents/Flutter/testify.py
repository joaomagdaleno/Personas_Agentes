from persona_base import BaseActivePersona
import os
import re

class TestifyPersona(BaseActivePersona):
    """Especialista em QA Flutter."""
    def __init__(self, project_root):
        """Inicializa a persona Testify."""
        super().__init__(project_root)
        self.name = "Testify"
        self.emoji = "🧪"
        self.role = "Testing Specialist"
        self.mission = "Ensure applications are reliable, bug-free and maintainable."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita cobertura de testes e estabilidade."""
        issues = []
        if not self.project_root: return []
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build', '.dart_tool']]
            for file in files:
                if file.endswith('.dart') and 'lib/' in root:
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    test_file = file.replace('.dart', '_test.dart')
                    if not os.path.exists(os.path.join(self.project_root, 'test', test_file)):
                        issues.append({'file': rel_path, 'issue': 'Falta arquivo de teste unitário correspondente.', 'severity': 'medium', 'context': 'QA/Reliability'})
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji}. Focus on testing strategies, code coverage and quality gates.'