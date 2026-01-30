from src.agents.base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class TestifyPersona(BaseActivePersona):
    """
    Especialista em qualidade e testes.
    Garante que cada funcionalidade tenha sua contraparte de validação.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Testify"
        self.emoji = "🧪"
        self.role = "Quality Assurance Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Busca arquivos de código sem cobertura de testes correspondente."""
        logger.info(f"[{self.name}] Analisando cobertura de arquivos de teste...")
        
        issues = []
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in self.ignored_dirs]
            for file in files:
                if file.endswith('.py') and not file.startswith('test_') and '__init__' not in file:
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    
                    # Procura por test_file.py na pasta tests/ ou no mesmo diretório
                    test_file = f"test_{file}"
                    has_test = os.path.exists(os.path.join(root, test_file)) or \
                               os.path.exists(os.path.join(self.project_root, 'tests', test_file))
                    
                    if not has_test:
                        issues.append({
                            'file': rel_path,
                            'issue': 'Arquivo de código sem arquivo de teste unitário correspondente.',
                            'severity': 'medium',
                            'context': self.name
                        })
        return issues

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Elevate the reliability through rigorous unit and integration testing.'
