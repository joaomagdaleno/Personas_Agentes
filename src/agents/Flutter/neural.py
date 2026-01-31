from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class NeuralPersona(BaseActivePersona):
    """
    Core: Flutter AI Specialist 🧠
    Foca na integração de Inteligência Artificial e modelos de ML on-device.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Neural"
        self.emoji = "🧠"
        self.role = "AI Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando pipelines de inteligência on-device...")
        
        neural_rules = [
            {
                'regex': r"GoogleGenerativeAI\(", 
                'issue': 'Integração direta com LLM detectada. Garanta que a API Key não esteja exposta no código-fonte.', 
                'severity': 'critical'
            }
        ]
        
        return self.find_patterns(('.dart'), neural_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Bring the power of intelligence to the user's pocket."
