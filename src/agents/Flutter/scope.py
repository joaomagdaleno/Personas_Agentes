from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class ScopePersona(BaseActivePersona):
    """
    Core: Flutter Product Specialist 🔭
    Foca na entrega de valor, requisitos técnicos e gerenciamento de funcionalidades.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Scope"
        self.emoji = "🔭"
        self.role = "Product Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando entrega de requisitos técnicos...")
        
        scope_rules = [
            {
                'regex': r"TODO", 
                'issue': 'Marcador de tarefa pendente detectado. Garanta que o débito técnico não comprometa o escopo da sprint.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.dart'), scope_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure engineering excellence aligns with product goals."
