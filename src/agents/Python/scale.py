from src.agents.base import BaseActivePersona
import logging
import os

logger = logging.getLogger(__name__)

class ScalePersona(BaseActivePersona):
    """
    Especialista em organização e escalabilidade de código.
    Foca em modularização e redução de arquivos excessivamente longos.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Scale"
        self.emoji = "🏗️"
        self.role = "Architecture Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Audita tamanho de arquivos e complexidade de organização."""
        logger.info(f"[{self.name}] Analisando modularidade e organização...")
        
        issues = []
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in self.ignored_dirs]
            for file in files:
                if file.endswith('.py'):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    content = self.read_project_file(rel_path)
                    if content:
                        line_count = len(content.split('\n'))
                        if line_count > 500:
                            issues.append({
                                'file': rel_path,
                                'issue': f'Arquivo com alta densidade ({line_count} linhas). Recomenda-se modularização para facilitar manutenção.',
                                'severity': 'medium',
                                'context': self.name
                            })
        return issues

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Structure the codebase for infinite growth and clarity.'
