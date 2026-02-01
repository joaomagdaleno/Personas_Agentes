from src.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class VaultPersona(BaseActivePersona):
    """
    Core: PhD in Digital Economy & Fintech Security 💎
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Vault", "💎", "PhD Financial Architect (Flutter)", "Flutter"

    def perform_audit(self) -> list:
        """Auditoria com telemetria financeira mobile integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Integridade Financeira...")
        
        # Sintaxe linear resiliente
        rules = [
            {'regex': r"InAppPurchase\.instance(?!.*completePurchase)", 'issue': 'Transação em Aberto: Risco de cobrança indevida.', 'severity': 'critical'},
            {'regex': r'price:\s*["\'].*?["\']', 'issue': 'Preço Estático: Use localPrice da Store.', 'severity': 'high'}
        ]
        
        results = self.find_patterns(('.dart',), rules)
        
        duration = time.time() - start_time
        logger.info(f"💎 [{self.name}] Auditoria finalizada em {duration:.4f}s. Pontos: {len(results)}")
        return results

    def _reason_about_objective(self, objective, file, content):
        if "InAppPurchase" in content:
            return f"Risco de Sustentabilidade: O objetivo '{objective}' exige fluxo de caixa íntegro. Em '{file}', falhas de faturamento ameaçam a economia da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da economia digital Flutter."
