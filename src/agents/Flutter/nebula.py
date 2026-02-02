from src.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class NebulaPersona(BaseActivePersona):
    """
    Core: PhD in Cloud Architecture & Mobile Backend (Flutter) ☁️
    Especialista em segurança de chaves, integração Firebase e isolamento de ambiente.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Nebula", "☁️", "PhD Cloud Architect", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Infraestrutura Cloud Flutter...")
        
        audit_rules = [
            {'regex': r"AK" + r"IA[0-9A-Z]{16}", 'issue': 'Vulnerabilidade Crítica: Chave AWS exposta no código Flutter.', 'severity': 'critical'},
            {'regex': r"htt" + r"ps://(?!.*\.google\.com|.*\.firebaseio\.com)", 'issue': 'Aviso: Domínio externo detectado. Verifique segurança de CORS.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.dart', '.json', '.yaml'), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw = "AK" + "IA"
        if kw in content and "rules =" not in content:
            return f"Catástrofe de Segurança: O objetivo '{objective}' exige proteção total. Credenciais expostas em '{file}' permitem o sequestro da 'Orquestração de Inteligência Artificial' via nuvem."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em soberania cloud Flutter."
