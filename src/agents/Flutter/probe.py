from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class ProbePersona(BaseActivePersona):
    """
    Core: PhD in System Integrity & Forensic Diagnostics (Flutter) 🔍
    Especialista em detecção de vazamentos de memória, integridade de estado e rastro de auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Probe", "🔍", "PhD Diagnostics Engineer", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Integridade Forense Flutter...")
        
        audit_rules = [
            {'regex': r"dispose\(\)\s*\{\s*\}", 'issue': 'Vazamento de Memória: Método dispose() vazio ou não implementado em controlador.', 'severity': 'critical'},
            {'regex': r"catch\s*\(.*?\)\s*\{\s*pass\s*\}", 'issue': 'Cegueira Forense: Erro silenciado detectado no Dart.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "dispose()" in content and "{ }" in content:
            return f"Corrupção de Memória: O objetivo '{objective}' exige estabilidade. Em '{file}', a falta de liberação de recursos paralisará a 'Orquestração de Inteligência Artificial' em execuções longas."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em diagnósticos forenses Flutter."
