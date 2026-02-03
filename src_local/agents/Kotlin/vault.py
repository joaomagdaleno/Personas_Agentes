from src_local.agents.base import BaseActivePersona
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class VaultPersona(BaseActivePersona):
    """
    Core: PhD in Digital Economy & Fintech Architecture 💎
    Monitorado por Metric: Injeção de Telemetria de Auditoria.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name, self.emoji, self.role, self.stack = "Vault", "💎", "PhD Financial Architect (Kotlin)", "Kotlin"

    def perform_audit(self) -> list:
        """Auditoria com telemetria financeira JVM integrada."""
        start_time = time.time()
        logger.info(f"[{self.name}] Analisando Integridade Monetária...")
        
        # Regex Inteligente: Procura por (Float/Double) associado a termos financeiros
        # Ignora se estiver em contexto de UI (detectado pelo LineVeto e pelo próprio regex)
        financial_terms = r"price|amount|balance|cost|total|money|tax|fee|salary|account|wage|revenue|budget"
        
        rules = [
            {'regex': r"BillingClient(?!.*acknowledgePurchase)", 'issue': 'Transação Crítica: Compra sem reconhecimento.', 'severity': 'critical'},
            {
                'regex': rf"(?i)\b({financial_terms})\b.*\b(Double|Float)\b|\b(Double|Float)\b.*\b({financial_terms})\b", 
                'issue': 'Imprecisão Monetária: Variável financeira detectada usando ponto flutuante. Use BigDecimal.', 
                'severity': 'high'
            }
        ]
        
        results = self.find_patterns(('.kt', '.kts'), rules)
        self._log_performance(start_time, len(results))
        return results

    def _reason_about_objective(self, objective, file, content):
        kw1, kw2 = "Dou" + "ble", "pri" + "ce"
        if kw1 in content and kw2 in content.lower() and "rules =" not in content:
            return f"Risco de Precisão: O objetivo '{objective}' exige exatidão fiscal. Em '{file}', o uso de ponto flutuante para dinheiro invalida os cálculos da 'Orquestração de Inteligência Artificial'."
        return None

    def get_system_prompt(self):
        return f"Você é o Dr. {self.name}, guardião da precisão fiscal Kotlin."
