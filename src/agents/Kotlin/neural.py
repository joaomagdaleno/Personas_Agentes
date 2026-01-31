from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class NeuralPersona(BaseActivePersona):
    """
    Core: Kotlin AI Specialist 🧠
    Foca na integração de Inteligência Artificial e modelos de aprendizado de máquina no Android.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Neural"
        self.emoji = "🧠"
        self.role = "AI Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando pipelines de processamento inteligente...")
        
        neural_rules = [
            {
                'regex': r"com\.google\.mlkit", 
                'issue': 'Uso de MLKit detectado. Excelente para IA on-device! Verifique o gerenciamento de modelos para download offline.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.kt', '.gradle'), neural_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Build intelligent applications that learn and adapt."
