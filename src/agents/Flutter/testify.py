from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class TestifyPersona(BaseActivePersona):
    """
    Core: Flutter Testing Specialist 🧪
    Foca na cobertura de testes e qualidade do código Dart/Flutter.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Testify"
        self.emoji = "🧪"
        self.role = "Testing Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando cobertura e validade dos testes...")
        
        testify_rules = [
            {
                'regex': r"testWidgets\(", 
                'issue': 'Widget Test detectado. Garanta que as interações de UI sejam validadas.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.dart'), testify_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure every widget behaves as expected."
