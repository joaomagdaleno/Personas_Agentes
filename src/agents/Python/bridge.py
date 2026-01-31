from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class BridgePersona(BaseActivePersona):
    """
    Core: Integration Specialist 🌉
    Foca na interoperabilidade entre diferentes sistemas, linguagens e camadas nativas.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Bridge"
        self.emoji = "🌉"
        self.role = "Integration Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando pontes de integração e chamadas nativas...")
        
        bridge_rules = [
            {
                'regex': r"ctypes\.CDLL\(.*\)|ctypes\.WinDLL\(.*\)", 
                'issue': 'Carregamento de DLL nativa detectado. Garanta que o caminho seja dinâmico e seguro para diferentes SOs.', 
                'severity': 'medium'
            },
            {
                'regex': r"subprocess\.run\(.*shell=True", 
                'issue': 'Uso de shell=True em integrações de sistema. Alto risco de injeção se houver parâmetros externos.', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns(('.py'), bridge_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Bridge the gap between system layers with stability and safety."