from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class CachePersona(BaseActivePersona):
    """
    Core: PhD in Data Locality & Synchronization (Flutter) 🗄️
    Especialista em persistência local e reatividade de estado no Flutter.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Cache", "🗄️", "PhD Data Architect", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Eficiência de Cache Flutter...")
        
        audit_rules = [
            {'regex': r"SharedPreferences\.getInstance\(\)", 'issue': 'Performance: Acesso repetitivo ao disco. Use um Singleton para SharedPreferences.', 'severity': 'medium'},
            {'regex': r"hive\.box\(.*?\)\.clear\(\)", 'issue': 'Risco: Limpeza abrupta de cache detectada.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "SharedPreferences" in content:
            return f"Lentidão Sistêmica: O objetivo '{objective}' exige velocidade. Em '{file}', acessos frequentes ao disco prejudicam a 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em gestão de estados e persistência Flutter."
