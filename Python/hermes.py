from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class HermesPersona(BaseActivePersona):
    """Especialista em DevOps Python do Personas Agentes."""
    
    def __init__(self, project_root):
        """Inicializa a persona Hermes."""
        super().__init__(project_root)
        self.name = "Hermes"
        self.emoji = "📦"
        self.role = "DevOps & Delivery Specialist"
        self.mission = "Maintain CI/CD pipelines and package integrity."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em arquivos de dependências e distribuição."""
        issues = []
        if not self.project_root:
            return []
            
        # Verifica arquivos essenciais de dependência na raiz
        has_deps = (os.path.exists(os.path.join(self.project_root, 'requirements.txt')) or 
                    os.path.exists(os.path.join(self.project_root, 'pyproject.toml')))
                    
        if not has_deps:
            issues.append({
                'file': 'Raiz', 
                'issue': 'Arquivo de dependências ausente (requirements.txt ou pyproject.toml).', 
                'severity': 'high', 
                'context': 'DevOps'
            })
            
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'