from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class BoltPersona(BaseActivePersona):
    """
    Core: PhD in Computational Efficiency (Kotlin) ⚡
    Especialista em performance Android e eficiência de corrotinas.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Bolt", "⚡", "PhD Performance Engineer", "Kotlin"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Eficiência no ecossistema Kotlin...")
        
        # Regras específicas para Kotlin/Android
        audit_rules = [
            {'regex': r"Thread\.sleep\(", 'issue': 'Risco: Bloqueio de Thread detectado. Use delay() em corrotinas.', 'severity': 'critical'},
            {'regex': r"while\s*\(true\)\s*\{\s*\}", 'issue': 'Gargalo: Loop infinito de espera ativa.', 'severity': 'critical'},
            {'regex': r"runBlocking", 'issue': 'Aviso: runBlocking detectado. Verifique se é estritamente necessário.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.kt', '.kts'), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "Thread.sleep" in content:
            return f"Paralisia Sistêmica: O objetivo '{objective}' exige reatividade. Em '{file}', o uso de Thread.sleep() pode congelar a 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em performance Kotlin e Android."