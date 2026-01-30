from persona_base import BaseActivePersona
import os
import re

class MantraPersona(BaseActivePersona):
    """Especialista em excelência Pythonica."""
    def __init__(self, project_root):
        """Inicializa a persona com o diretório raiz do projeto."""
        super().__init__(project_root)
        self.name = "Mantra"
        self.emoji = "🐍"
        self.role = "Self-Healing Specialist"
        self.mission = "Guardian of Pythonic excellence."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em auto-cura e padrões Python."""
        issues = []
        if not self.project_root: return []
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build', 'node_modules', '__pycache__']]
            for file in files:
                if file.endswith('.py'):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    try:
                        with open(os.path.join(root, file), 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                        if "BaseActivePersona" in content and "abc" not in content and "abstractmethod" not in content:
                            if "class " in content and "Persona" in content:
                                issues.append({'file': rel_path, 'issue': 'Persona sem herança formal ou métodos abstratos.', 'severity': 'medium', 'context': 'Mantra'})
                    except Exception:
                        continue
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'