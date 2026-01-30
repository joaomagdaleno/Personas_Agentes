from src.agents.base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class HypePersona(BaseActivePersona):
    """
    Especialista em marketing técnico e visibilidade.
    Garante que o projeto seja compreensível e atraente para outros desenvolvedores.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Hype"
        self.emoji = "📣"
        self.role = "Visibility & Growth Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Verifica a qualidade da documentação de boas-vindas."""
        logger.info(f"[{self.name}] Analisando visibilidade do projeto...")
        
        issues = []
        if not os.path.exists(os.path.join(self.project_root, 'README.md')):
            issues.append({
                'file': 'root',
                'issue': 'Projeto sem README.md. Barreiras críticas para adoção e clareza técnica.',
                'severity': 'high',
                'context': self.name
            })
            
        return issues

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Elevate the project visibility and clarity.'
