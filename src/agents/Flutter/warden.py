from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class WardenPersona(BaseActivePersona):
    """
    Core: PhD in Digital Ethics & Privacy Compliance ⚖️
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Warden", "⚖️", "PhD Privacy Officer (Flutter)", "Flutter"

    def perform_audit(self) -> list:
        """Auditoria com telemetria ética mobile integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Conformidade Ética...")
        
        # Sintaxe linear resiliente
        rules = [
            {'regex': r"Permission\..*?\.request\(", 'issue': 'Compliance: Pedido de permissão opaco.', 'severity': 'high'},
            {'regex': r"AdvertisingIdClient", 'issue': 'Privacidade: Rastreamento via IDFA/AAID detectado.', 'severity': 'critical'}
        ]
        
        results = self.find_patterns(('.dart',), rules)
        
        duration = time.time() - start_time
        logger.info(f"⚖️ [{self.name}] Auditoria finalizada em {duration:.4f}s. Pontos éticos: {len(results)}")
        return results

    def _reason_about_objective(self, objective, file, content):
        if "request" in content:
            return f"Risco de Governança: O objetivo '{objective}' exige ética. Em '{file}', a falta de transparência em permissões ameaça a legitimidade da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da privacidade Flutter."
