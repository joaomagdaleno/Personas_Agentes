from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class NebulaPersona(BaseActivePersona):
    """
    Core: PhD in Cloud Architecture & Mobile Backend (Flutter) Ôÿü´©Å
    Especialista em seguran├ºa de chaves, integra├º├úo Firebase e isolamento de ambiente.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Nebula", "Ôÿü´©Å", "PhD Cloud Architect", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Infraestrutura Cloud Flutter...")
        
        audit_rules = [
            {'regex': 'AKIA[0-9A-Z]{16}', 'issue': 'Vulnerabilidade Cr├¡tica: Chave AWS exposta no c├│digo Flutter.', 'severity': 'critical'},
            {'regex': 'https://(?!.*\\.google\\.com|.*\\.firebaseio\\.com)', 'issue': 'Aviso: Dom├¡nio externo detectado. Verifique seguran├ºa de CORS.', 'severity': 'medium'}
        ]
        
        results = self.find_patterns(('.dart', '.json', '.yaml'), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw = 'AKIA'
        if kw in content and "rules =" not in content:
            return f"Cat├ístrofe de Seguran├ºa: O objetivo '{objective}' exige prote├º├úo total. Credenciais expostas em '{file}' permitem o sequestro da 'Orquestra├º├úo de Intelig├¬ncia Artificial' via nuvem."
        return None

    def get_system_prompt(self):
        return f"Voc├¬ ├® o Dr. {self.name}, mestre em soberania cloud Flutter."
