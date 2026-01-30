from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class NexusPersona(BaseActivePersona):
    """
    Especialista em conectividade e protocolos de rede.
    Garante que as integrações externas sejam resilientes e seguras.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Nexus"
        self.emoji = "🌐"
        self.role = "Connectivity Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Audita resiliência de chamadas externas."""
        logger.info(f"[{self.name}] Validando resiliência de rede...")
        
        patterns = [
            {
                'regex': r"requests\.(get|post|put|delete)\((?!.*timeout)", 
                'issue': 'Requisição HTTP sem timeout. Risco crítico de travar a aplicação indefinidamente.', 
                'severity': 'high'
            },
            {
                'regex': r"http://(?!localhost|127\.0\.0\.1)", 
                'issue': 'Endpoint HTTP detectado. Use HTTPS para garantir a segurança em trânsito.', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns('.py', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Connect worlds through reliable and secure protocols.'
