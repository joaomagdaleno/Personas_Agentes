from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class BridgePersona(BaseActivePersona):
    """
    Especialista em integração nativa.
    Foca em chamadas de sistema, C-extensions e segurança de tipos nativos.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Bridge"
        self.emoji = "🌉"
        self.role = "Native Integration Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Audita riscos em chamadas nativas."""
        logger.info(f"[{self.name}] Analisando integrações nativas...")
        
        patterns = [
            {
                'regex': r"ctypes\.|cffi", 
                'issue': 'Chamada nativa detectada. Verifique a proteção try-except para evitar segmentation faults.', 
                'severity': 'high'
            },
            {
                'regex': r"os\.system\(", 
                'issue': 'Uso de os.system detectado. Recomenda-se o uso do módulo subprocess para maior segurança.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns('.py', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Ensure safe and efficient system-level connectivity.'
