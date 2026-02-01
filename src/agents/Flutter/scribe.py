from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class ScribePersona(BaseActivePersona):
    """
    Core: PhD in Technical Writing & Knowledge Management (Flutter) ✍️
    Especialista em DartDoc, clareza semântica e documentação de APIs.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Scribe", "✍️", "PhD Technical Writer", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Documentação Flutter...")
        
        audit_rules = [
            {'regex': r"class\s+\w+\s*\{(?![^}]*///)", 'issue': 'Vácuo Documental: Classe sem DartDoc (///).', 'severity': 'low'},
            {'regex': r"void\s+main\(\)\s*\{(?![^}]*///)", 'issue': 'Falta de Contexto: Ponto de entrada sem documentação.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "///" not in content and ("class" in content or "void" in content):
            return f"Amnésia Técnica: O objetivo '{objective}' exige clareza. Em '{file}', a falta de documentação torna a 'Orquestração de Inteligência Artificial' um sistema de caixa preta."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em documentação técnica Flutter."
