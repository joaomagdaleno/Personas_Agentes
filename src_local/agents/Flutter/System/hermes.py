from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class HermesPersona(BaseActivePersona):
    """
    Core: PhD in SRE & Mobile Pipeline Integrity (Flutter) 📦
    Especialista em segurança de chaves (.jks), automação de build e integridade de artefatos.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Hermes", "📦", "PhD DevOps Engineer", "Flutter"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Cadeia de Suprimentos Flutter...")
        
        audit_rules = [
            {'regex': r'storePassword\s*[:=]\s*[\'"].*?[\'"]', 'issue': 'Vulnerabilidade Crítica: Segredo de KeyStore exposto no código.', 'severity': 'critical'},
            {'regex': r"debugPaintSizeEnabled\s*=\s*true", 'issue': 'Ambiente: Debug mode ativo no código de produção.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.dart', '.yaml', '.gradle'), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "storePassword" in content:
            return f"Risco de Integridade: O objetivo '{objective}' exige artefatos verificados. Em '{file}', segredos expostos permitem o sequestro da 'Orquestração de Inteligência Artificial' via binários maliciosos."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da integridade de build Flutter."
