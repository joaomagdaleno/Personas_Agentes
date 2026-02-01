from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class NebulaPersona(BaseActivePersona):
    """
    Core: PhD in Cloud Computing ☁️
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Nebula", "☁️", "PhD Cloud Architect", "Python"

    def perform_audit(self) -> list:
        """Auditoria com telemetria cloud integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Infraestrutura Cloud...")
        
        audit_rules = [
            {
                'regex': r"AKIA[0-9A-Z]{16}",
                'issue': 'Risco Crítico: Credencial AWS exposta.',
                'severity': 'critical'
            }
        ]
        
        results = self.find_patterns(('.py', '.yaml', '.yml'), audit_rules)
        
        duration = time.time() - start_time
        logger.info(f"☁️ [{self.name}] Auditoria finalizada em {duration:.4f}s. Pontos: {len(results)}")
        return results

    def _reason_about_objective(self, objective, file, content):
        if "AKIA" in content:
            return f"Catástrofe de Segurança: O objetivo '{objective}' exige proteção total. Credenciais em '{file}' permitem o sequestro da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, mestre em arquitetura cloud."
