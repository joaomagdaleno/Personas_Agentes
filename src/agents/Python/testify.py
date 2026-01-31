from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class TestifyPersona(BaseActivePersona):
    """
    Core: Testing & QA Specialist 🧪
    Foca na garantia de qualidade, cobertura de testes e prevenção de regressões.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Testify"
        self.emoji = "🧪"
        self.role = "Testing Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando cobertura e qualidade de testes...")
        
        testify_rules = [
            {
                'regex': r"assert .*", 
                'issue': 'Assert detectado. Garanta que testes unitários cubram as principais ramificações de erro.', 
                'severity': 'low'
            },
            {
                'regex': r"def test_.*:\s+pass", 
                'issue': 'Teste vazio detectado. O "pass" impede a validação real da funcionalidade.', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns(('.py', 'test_*.py'), testify_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure every line of code is reliable and verified."