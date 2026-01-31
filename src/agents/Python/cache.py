from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class CachePersona(BaseActivePersona):
    """
    Core: Persistence & Storage Specialist 🗄️
    Foca na eficiência do armazenamento de dados, consultas e estratégias de cache.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Cache"
        self.emoji = "🗄️"
        self.role = "Storage Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando persistência de dados e eficiência de queries...")
        
        cache_rules = [
            {
                'regex': r"SELECT \* FROM", 
                'issue': 'Uso de "SELECT *" detectado. Especifique as colunas para otimizar a performance e reduzir consumo de memória.', 
                'severity': 'medium'
            },
            {
                'regex': r"sqlite3\.connect\(.*['\"]:memory:['\"]", 
                'issue': 'Banco de dados em memória detectado. Garanta que a volatilidade dos dados seja aceitável para o caso de uso.', 
                'severity': 'low'
            },
            {
                'regex': r"for .* in .*:\s+.*\.execute\(", 
                'issue': 'Execução de query dentro de loop (N+1 problem). Considere o uso de bulk inserts ou joins.', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns(('.py', '.sql'), cache_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure data is stored and retrieved with maximum efficiency."