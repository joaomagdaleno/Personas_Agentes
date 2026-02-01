from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class MantraPersona(BaseActivePersona):
    """
    Core: PhD in Structural Integrity & Code Purity (Flutter) 🧘
    Especialista em Clean Architecture, desacoplamento de UI e padrões Dart.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Mantra", "🧘", "PhD Quality Architect", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Pureza do Código Flutter...")
        
        audit_rules = [
            {'regex': r"setState\(", 'issue': 'Acoplamento: Uso excessivo de setState. Considere um State Manager (Bloc/Provider).', 'severity': 'medium'},
            {'regex': r"catch\s*\(.*?\)\s*\{\s*\}", 'issue': 'Anti-padrão: Captura de exceção vazia (Bare except).', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "setState" in content:
            return f"Entropia Lógica: O objetivo '{objective}' exige modularidade. Em '{file}', o acoplamento de estado na UI dificulta a evolução da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em arquitetura e pureza Flutter."
