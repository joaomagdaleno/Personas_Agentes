from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class MantraPersona(BaseActivePersona):
    """
    Core: Code Quality Specialist 🧘
    Foca em Clean Code, princípios SOLID e padrões de projeto.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Mantra"
        self.emoji = "🧘"
        self.role = "Quality Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando padrões de código e legibilidade...")
        
        mantra_rules = [
            {
                'regex': r"def .*(self,.*,.*,.*,.*,.*):", # Muitos argumentos
                'issue': 'Função com muitos argumentos detectada. Considere aplicar o padrão "Introduce Parameter Object".', 
                'severity': 'medium'
            },
            {
                'regex': r"class .*:.*class .*:.*class", # Classes aninhadas excessivas
                'issue': 'Alta complexidade de aninhamento de classes. Pode violar o Princípio da Responsabilidade Única.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.py'), mantra_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure the codebase is a temple of clean and maintainable code."