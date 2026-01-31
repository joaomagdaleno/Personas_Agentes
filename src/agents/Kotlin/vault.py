from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class VaultPersona(BaseActivePersona):
    """
    Core: Kotlin Monetization Specialist 💎
    Foca no faturamento através da Google Play Store e gestão de assinaturas.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Vault"
        self.emoji = "💎"
        self.role = "Monetization Specialist"
        self.stack = "Kotlin"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando fluxos de cobrança e segurança financeira...")
        
        vault_rules = [
            {
                'regex': r"BillingClient", 
                'issue': 'Integração com Google Play Billing detectada. Garanta a validação segura de recibos no servidor.', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns(('.kt'), vault_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Optimize revenue while maintaining financial trust."
