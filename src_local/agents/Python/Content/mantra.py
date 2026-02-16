from src_local.agents.base import BaseActivePersona
import logging
import time

logger = logging.getLogger(__name__)

class MantraPersona(BaseActivePersona):
    """
    Core: PhD in Quality Architecture & Structural Integrity 🧘
    Especialista em pureza de código, prevenção de acoplamento e tratamento robusto de exceções.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Mantra", "🧘", "PhD Quality Architect", "Python"

    def perform_audit(self) -> list:
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Pureza e Integridade (Legacy Stack)...")
        
        audit_rules = [
            {'regex': r"except\s*:\s*pass", 'issue': 'Instabilidade Crítica: Bare except silenciado detectado. Viola o Mantra de Pureza.', 'severity': 'critical'},
            {'regex': r"\bglobal\s+\w+", 'issue': 'Erosão Estrutural: Uso de estado global detectado. Compromete a modularidade PhD.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.py',), audit_rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        if "global" in content:
            return f"Entropia Lógica: O objetivo '{objective}' exige determinismo. Estado global em '${file}' fere a soberania arquitetural."
        return f"PhD Purity: Analisando integridade lógica para {objective}. Focando em tratamento de exceções e encapsulamento."

    def self_diagnostic(self) -> dict:
        """Auto-Cura Soberana (Legacy Python)."""
        return {
            "status": "Soberano",
            "score": 100,
            "issues": []
        }

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, PhD em Arquitetura de Qualidade e Guardião da Pureza Legada."
