from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class WardenPersona(BaseActivePersona):
    """
    Core: Compliance Specialist ⚖️
    Foca em conformidade legal (LGPD, GDPR), termos de uso e licenciamento.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Warden"
        self.emoji = "⚖️"
        self.role = "Compliance Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando conformidade legal e privacidade de dados...")
        
        warden_rules = [
            {
                'regex': r"personal_data|email|phone", 
                'issue': 'Tratamento de dados sensíveis detectado. Garanta a conformidade com a LGPD e o consentimento do usuário.', 
                'severity': 'high'
            },
            {
                'regex': r"LICENSE", 
                'issue': 'Arquivo de licença detectado. Garanta que todas as dependências respeitem esta licença.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.py', '.md', 'LICENSE'), warden_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Protect the project from legal risks and ensure user privacy."