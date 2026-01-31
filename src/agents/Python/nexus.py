from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class NexusPersona(BaseActivePersona):
    """
    Core: API & Connectivity Specialist 🌐
    Foca na integração com serviços externos, contratos de API e protocolos de comunicação.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Nexus"
        self.emoji = "🌐"
        self.role = "API Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando camadas de rede e integração...")
        
        nexus_rules = [
            {
                'regex': r"requests\.(get|post|put|delete)\(.*\bverify=False\b", 
                'issue': 'Requisição com verificação SSL desativada. Risco de segurança.', 
                'severity': 'high'
            },
            {
                'regex': r"timeout=None", 
                'issue': 'Requisição sem timeout definido. Pode causar travamento da aplicação se o servidor não responder.', 
                'severity': 'medium'
            },
            {
                'regex': r"json\.loads\(.*\.text\)", 
                'issue': 'Serialização direta de texto para JSON detectada. Prefira usar .json() do requests para tratamento automático de encoding.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.py'), nexus_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure robust, secure, and efficient API integrations."