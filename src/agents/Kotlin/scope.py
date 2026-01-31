from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class ScopePersona(BaseActivePersona):
    """
    Core: Kotlin Product Specialist 🔭
    Foca no alinhamento entre as funcionalidades técnicas e a visão do produto Android.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Scope"
        self.emoji = "🔭"
        self.role = "Product Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Analisando alinhamento de escopo técnico...")
        
        scope_rules = [
            {
                'regex': r"TODO", 
                'issue': 'Marcador de tarefa pendente detectado. Verifique se isso não atrasará o lançamento.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.kt'), scope_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Maintain the technical focus on product goals."
