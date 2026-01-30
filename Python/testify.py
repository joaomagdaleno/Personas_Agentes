from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class TestifyPersona(BaseActivePersona):
    """Especialista em testes Python do Personas Agentes.
    Foca na confiabilidade do código através de testes unitários e de integração.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Testify."""
        super().__init__(project_root)
        self.name = "Testify"
        self.emoji = "🧪"
        self.role = "Testing Specialist"
        self.mission = "Ensure unit and integration reliability through rigorous testing."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em cobertura de arquivos de teste."""
        issues = []
        if not self.project_root:
            return []
            
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build', 'node_modules', '__pycache__', 'venv']]
            for file in files:
                # Ignora o próprio sistema de teste e diretórios de controle
                if file.endswith('.py') and 'test' not in file.lower() and '__init__' not in file:
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    
                    # Procura por padrões comuns de teste (ex: test_file.py ou file_test.py)
                    test_variants = [
                        f"test_{file}",
                        file.replace('.py', '_test.py'),
                        file.replace('.py', '.test.py')
                    ]
                    
                    has_test = any(os.path.exists(os.path.join(root, v)) for v in test_variants)
                    
                    if not has_test:
                        issues.append({
                            'file': rel_path, 
                            'issue': 'Arquivo de código sem arquivo de teste correspondente no mesmo diretório.', 
                            'severity': 'medium', 
                            'context': 'Quality'
                        })
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'