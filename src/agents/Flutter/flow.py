from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class FlowPersona(BaseActivePersona):
    """
    Core: Flutter Navigation Specialist 🌊
    Foca no fluxo de telas, rotas e gerenciamento de pilha de navegação.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Flow"
        self.emoji = "🌊"
        self.role = "Navigation Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando rotas e transições de tela...")
        
        flow_rules = [
            {
                'regex': r"Navigator\.push\(.*MaterialPageRoute", 
                'issue': 'Navegação imperativa detectada. Considere usar rotas nomeadas ou Navigator 2.0 para maior escalabilidade.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.dart'), flow_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Create seamless and predictable user journeys."
