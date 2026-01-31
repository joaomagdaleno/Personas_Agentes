from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class BoltPersona(BaseActivePersona):
    """
    Core: Kotlin Performance Specialist ⚡
    Foca na eficiência de Coroutines, otimização do Compose e performance de I/O.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Bolt"
        self.emoji = "⚡"
        self.role = "Performance Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando performance de Coroutines e UI...")
        
        kotlin_performance_rules = [
            {
                'regex': r"Thread\.sleep", 
                'issue': 'Thread.sleep detectado em Kotlin. Use delay() dentro de uma Coroutine para evitar o bloqueio da thread.', 
                'severity': 'high'
            },
            {
                'regex': r"@Composable\s+fun .*\(\)\s*\{.*var .* by remember", 
                'issue': 'Estado do Compose detectado. Garanta o uso de subcomposição mínima para evitar recomposições pesadas.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.kt', '.kts'), kotlin_performance_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Make the Android app exceptionally fast and smooth."
