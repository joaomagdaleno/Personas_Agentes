from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class CachePersona(BaseActivePersona):
    """
    Core: PhD in Data Locality & Synchronization (Kotlin) 🗄️
    Especialista em persistência Room, DataStore e eficiência de I/O em Android.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Cache", "🗄️", "PhD Data Architect", "Kotlin"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Eficiência de Acesso a Dados Kotlin...")
        
        audit_rules = [
            {'regex': r"allowMainThreadQueries\(\)", 'issue': 'Gargalo Crítico: Queries SQL na Main Thread bloqueiam a UI.', 'severity': 'critical'},
            {'regex': r"pref\.edit\(\)\.commit\(\)", 'issue': 'Performance: Use apply() em vez de commit() para salvar preferências de forma assíncrona.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.kt', '.kts'), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "allowMainThreadQueries" in content:
            return f"Paralisia de I/O: O objetivo '{objective}' exige fluidez. Em '{file}', queries na thread principal travam a 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em arquitetura de dados e Room Database."