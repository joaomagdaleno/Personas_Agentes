from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class NeuralPersona(BaseActivePersona):
    """
    Core: PhD in Machine Learning & Cognitive Architecture (Flutter) 🧠
    Especialista em segurança de tokens IA, processamento on-device e agentes Flutter.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Neural", "🧠", "PhD AI Architect", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Camadas de IA Flutter...")
        
        audit_rules = [
            {'regex': r'apiKey:\s*[\'"].*?[\'"]', 'issue': 'Vulnerabilidade Crítica: Chave de API de IA exposta. Use .env ou secure storage.', 'severity': 'critical'},
            {'regex': r"temperature:\s*[01]\.[0-9]+", 'issue': 'Aviso: Parâmetro de criatividade detectado. Verifique se condiz com o objetivo.', 'severity': 'low'}
        ]
        
        results = self.find_patterns(('.dart',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "apiKey:" in content:
            return f"Risco de Autonomia: O objetivo '{objective}' exige segurança de tokens. Em '{file}', a exposição de chaves compromete a 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em arquitetura cognitiva Flutter."
