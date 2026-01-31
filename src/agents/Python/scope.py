from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class ScopePersona(BaseActivePersona):
    """
    Core: Product & Requirements Specialist 🔭
    Foca no alinhamento técnico com os requisitos de negócio e escopo do produto.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Scope"
        self.emoji = "🔭"
        self.role = "Product Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando alinhamento de escopo e requisitos...")
        
        # O Scope foca em marcadores de requisitos e dívida técnica
        scope_rules = [
            {
                'regex': r"deprecated|obsoleto", 
                'issue': 'Código marcado como depreciado/obsoleto detectado. Verifique o plano de migração ou remoção.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.py', '.md'), scope_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Bridge the gap between business vision and technical execution."