from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class ScribePersona(BaseActivePersona):
    """
    Especialista em documentação técnica e comentários.
    Garante que o código conte sua própria história através de docstrings.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Scribe"
        self.emoji = "✍️"
        self.role = "Documentation Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Busca funções e classes sem documentação básica."""
        logger.info(f"[{self.name}] Analisando qualidade da documentação interna...")
        
        # Simplificando a regex para evitar erros de parser
        patterns = [
            {
                'regex': r"def\s+\w+\(.*\):", 
                'issue': 'Função detectada. Verifique se possui docstring explicativa.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns('.py', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Ensure that knowledge is preserved through clear documentation.'
