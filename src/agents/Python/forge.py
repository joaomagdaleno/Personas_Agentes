from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class ForgePersona(BaseActivePersona):
    """
    Core: Automation Specialist ⚒️
    Foca na geração de código, ferramentas de scaffolding e automação de tarefas.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Forge"
        self.emoji = "⚒️"
        self.role = "Automation Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando ferramentas de automação e geração...")
        
        forge_rules = [
            {
                'regex': r"f\.write\(.*f['\"]", 
                'issue': 'Geração de código via f-string detectada. Considere usar Jinja2 ou outros motores de template para maior segurança e limpeza.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.py'), forge_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Automate the boring stuff with precision and quality."