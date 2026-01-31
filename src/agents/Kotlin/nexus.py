from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class NexusPersona(BaseActivePersona):
    """
    Core: Kotlin API Specialist 🌐
    Foca na comunicação de rede, contratos de API e reatividade de dados (Flow).
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Nexus"
        self.emoji = "🌐"
        self.role = "API Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando camadas de rede e serialização de dados...")
        
        nexus_rules = [
            {
                'regex': r"Retrofit\.Builder", 
                'issue': 'Retrofit detectado. Garanta o uso de adaptadores de Coroutines para chamadas assíncronas seguras.', 
                'severity': 'low'
            },
            {
                'regex': r"@Serializable", 
                'issue': 'Serialização via Kotlinx detectada. Garanta que todos os campos da API estejam mapeados para evitar quebras em tempo de execução.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.kt'), nexus_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Connect the app to the world with high resilience."
