from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class ProbePersona(BaseActivePersona):
    """
    Core: Flutter Diagnostics Specialist 🔍
    Foca no rastreio de erros, logs de depuração e diagnósticos de crash.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Probe"
        self.emoji = "🔍"
        self.role = "Diagnostics Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Investigando logs e potenciais falhas lógicas...")
        
        probe_rules = [
            {
                'regex': r"print\(", 
                'issue': 'Uso de print() detectado. Prefira o uso de debugPrint() ou logs do kDebugMode para evitar vazamento em produção.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.dart'), probe_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Be the detective that finds every hidden bug."
