from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class NexusPersona(BaseActivePersona):
    """
    Core: Flutter API Specialist 🌐
    Foca na comunicação de rede, tratamento de erros HTTP e serialização de dados.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Nexus"
        self.emoji = "🌐"
        self.role = "API Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando camadas de networking e modelos de dados...")
        
        nexus_rules = [
            {
                'regex': r"http\.get\(", 
                'issue': 'Uso da biblioteca http padrão detectado. Para projetos grandes, considere o "dio" pelo suporte a interceptores e cancelamento.', 
                'severity': 'low'
            },
            {
                'regex': r"jsonDecode\(", 
                'issue': 'Serialização manual detectada. Considere usar "json_serializable" para evitar erros de digitação em chaves JSON.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.dart'), nexus_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Connect the app to the world with resilience and speed."
