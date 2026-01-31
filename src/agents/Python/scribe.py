from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class ScribePersona(BaseActivePersona):
    """
    Core: Documentation Specialist ✍️
    Foca na clareza do código, documentação técnica e transferência de conhecimento.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Scribe"
        self.emoji = "✍️"
        self.role = "Documentation Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando qualidade da documentação e docstrings...")
        
        scribe_rules = [
            {
                'regex': r"def .*(.*):\s+['\"]{3}['\"]{3}", # Docstring vazia
                'issue': 'Docstring vazia detectada em função. Adicione uma descrição para facilitar a manutenção.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.py', '.md'), scribe_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure the codebase tells a clear and accessible story."