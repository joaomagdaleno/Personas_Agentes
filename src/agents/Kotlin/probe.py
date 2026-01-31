from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class ProbePersona(BaseActivePersona):
    """
    Core: Kotlin Diagnostics Specialist 🔍
    Foca no rastreio de erros, logs de sistema e diagnóstico de problemas em tempo real.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Probe"
        self.emoji = "🔍"
        self.role = "Diagnostics Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Investigando logs e potenciais falhas no Android...")
        
        probe_rules = [
            {
                'regex': r"Log\.(d|i|w|e|v)\(", 
                'issue': 'Uso de android.util.Log detectado. Prefira uma biblioteca como "Timber" para gerenciar logs de forma mais limpa em produção.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.kt'), probe_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Find every error before the user does."
