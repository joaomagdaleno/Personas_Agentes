from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class FlowPersona(BaseActivePersona):
    """
    Core: Kotlin Navigation Specialist 🌊
    Foca no fluxo de telas, Navigation Component e transições no Android.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Flow"
        self.emoji = "🌊"
        self.role = "Navigation Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando rotas de navegação e grafos de telas...")
        
        flow_rules = [
            {
                'regex': r"rememberNavController\(", 
                'issue': 'NavController detectado. Garanta que a navegação seja testável e desacoplada dos Composables.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.kt'), flow_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure a fluid and logical flow throughout the application."
