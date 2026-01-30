from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class ForgePersona(BaseActivePersona):
    """
    Especialista em automação de build e CI/CD.
    Garante que os scripts de infraestrutura sejam robustos e resilientes.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Forge"
        self.emoji = "🔨"
        self.role = "Build & Automation Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Audita scripts de automação em busca de falhas de tratamento."""
        logger.info(f"[{self.name}] Analisando robustez de scripts de build...")
        
        patterns = [
            {
                'regex': r"import os|import subprocess", 
                'issue': 'Script de infraestrutura detectado. Certifique-se de que erros de comando externo sejam capturados.', 
                'severity': 'low'
            },
            {
                'regex': r"subprocess\.run\(.*check=False", 
                'issue': 'Execução de subprocesso ignorando erros (check=False). Risco de falha silenciosa no build.', 
                'severity': 'medium'
            }
        ]
        
        # Audita arquivos de script comuns
        return self.find_patterns('.py', patterns) + self.find_patterns('.ps1', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Automate and harden internal processes.'
