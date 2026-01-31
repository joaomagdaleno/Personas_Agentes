from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class CachePersona(BaseActivePersona):
    """
    Core: Flutter Storage Specialist 🗄️
    Foca na persistência de dados local, cache de imagens e estado offline.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Cache"
        self.emoji = "🗄️"
        self.role = "Storage Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando persistência local e cache...")
        
        cache_rules = [
            {
                'regex': r"SharedPreferences\.getInstance\(\)", 
                'issue': 'Uso de SharedPreferences detectado. Para dados sensíveis, considere usar flutter_secure_storage.', 
                'severity': 'medium'
            },
            {
                'regex': r"await\s+Hive\.openBox\(", 
                'issue': 'Abertura de Box do Hive detectada. Certifique-se de fechar ou gerenciar o ciclo de vida da conexão.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.dart'), cache_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Manage local data with speed and security."
