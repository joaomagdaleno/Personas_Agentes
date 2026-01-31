from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class BridgePersona(BaseActivePersona):
    """
    Core: Kotlin Integration Specialist 🌉
    Foca na interoperabilidade entre Kotlin, Java e código nativo (C++ via JNI).
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Bridge"
        self.emoji = "🌉"
        self.role = "Integration Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando pontes JNI e interoperabilidade Java...")
        
        bridge_rules = [
            {
                'regex': r"external fun", 
                'issue': 'Função nativa detectada. Garanta que a biblioteca nativa correspondente seja carregada corretamente.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.kt'), bridge_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Connect Kotlin to the deepest layers of the system."
