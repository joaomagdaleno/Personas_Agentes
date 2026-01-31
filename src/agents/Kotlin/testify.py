from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class TestifyPersona(BaseActivePersona):
    """
    Core: Kotlin Testing Specialist 🧪
    Foca na qualidade de código através de testes unitários e de instrumentação.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Testify"
        self.emoji = "🧪"
        self.role = "Testing Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando cobertura de testes no Android...")
        
        testify_rules = [
            {
                'regex': r"@Test", 
                'issue': 'Teste detectado. Garanta a cobertura de casos de borda e falha.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.kt'), testify_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Build a fortress of reliability around the application."
