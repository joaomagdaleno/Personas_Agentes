from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class NeuralPersona(BaseActivePersona):
    """Core: PhD in AI 🧠"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Neural", "🧠", "PhD AI Architect", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Arquitetura de IA...")
        
        audit_rules = [
            {'regex': r"openai\.api_key|GOOGLE_API_KEY", 'issue': 'Vulnerabilidade: Chave de IA exposta.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "api_key" in content.lower():
            return f"Risco de Autonomia: O objetivo '{objective}' exige segurança de tokens. Em '{file}', a exposição de chaves compromete a 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em redes neurais."
