from src.agents.base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class HermesPersona(BaseActivePersona):
    """
    Especialista em DevOps e entrega.
    Garante que o projeto tenha todas as dependências e manifestos de distribuição.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Hermes"
        self.emoji = "📦"
        self.role = "DevOps & Delivery Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Verifica a presença de arquivos vitais de dependência."""
        logger.info(f"[{self.name}] Validando manifestos de dependência...")
        
        issues = []
        # Verifica raiz do projeto (project_root já aponta para ela)
        has_deps = (os.path.exists(os.path.join(self.project_root, 'requirements.txt')) or 
                    os.path.exists(os.path.join(self.project_root, 'pyproject.toml')))
                    
        if not has_deps:
            issues.append({
                'file': 'root',
                'issue': 'Nenhum arquivo de dependências encontrado (requirements.txt ou pyproject.toml).',
                'severity': 'high',
                'context': self.name
            })
            
        return issues

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Smooth delivery and reliable environment setup.'
