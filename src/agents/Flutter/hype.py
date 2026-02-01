from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class HypePersona(BaseActivePersona):
    """
    Core: PhD in Growth Vectors & Agent Discovery (Flutter) 📣
    Especialista em visibilidade do sistema, metadados de loja e engajamento.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Hype", "📣", "PhD Growth Lead", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Vetores de Crescimento Flutter...")
        
        audit_rules = [
            {'regex': r"com\.example", 'issue': 'Amadorismo: Package name padrão detectado. Altere para o seu domínio real.', 'severity': 'high'},
            {'regex': r'displayName:\s*[\'"]', 'issue': 'Invisibilidade: Nome de exibição não parametrizado.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.dart', '.xml', '.yaml'), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "com.example" in content:
            return f"Risco de Tração: O objetivo '{objective}' exige identidade única. Em '{file}', o uso de identificadores genéricos impede a descoberta e confiança na 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em visibilidade e tração Flutter."

