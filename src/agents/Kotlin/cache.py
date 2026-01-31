from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class CachePersona(BaseActivePersona):
    """
    Core: Kotlin Storage Specialist 🗄️
    Foca no uso de Room Database, DataStore e armazenamento persistente.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Cache"
        self.emoji = "🗄️"
        self.role = "Storage Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando persistência com Room e DataStore...")
        
        cache_rules = [
            {
                'regex': r"@Database", 
                'issue': 'Configuração do Room Database detectada. Garanta que as migrações sejam tratadas adequadamente.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.kt'), cache_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Manage data persistence with reliability and scale."
