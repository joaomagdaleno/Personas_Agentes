from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class EchoPersona(BaseActivePersona):
    """
    Core: Observability Specialist 🗣️
    Foca em logs, rastreabilidade e feedback do sistema para humanos.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Echo"
        self.emoji = "🗣️"
        self.role = "Observability Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando qualidade de logs e feedback...")
        
        echo_rules = [
            {
                'regex': r"except Exception:\s+pass", 
                'issue': 'Erro silenciado sem log. Isso torna o sistema impossível de debugar em produção.', 
                'severity': 'high'
            },
            {
                'regex': r"logger\.info\(.*['\"]Erro", 
                'issue': 'Uso de nível INFO para logar erros. Use logger.error() ou logger.exception() para correta categorização.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.py'), echo_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure the system communicates clearly its internal state."