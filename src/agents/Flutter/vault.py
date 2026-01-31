from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class VaultPersona(BaseActivePersona):
    """
    Core: Flutter Monetization Specialist 💎
    Foca na integração de pagamentos e compras dentro do aplicativo (IAP).
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Vault"
        self.emoji = "💎"
        self.role = "Monetization Specialist"
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando fluxos de monetização e compra...")
        
        vault_rules = [
            {
                'regex': r"InAppPurchase\.instance", 
                'issue': 'Sistema de compras detectado. Garanta que o fluxo de restauração de compras esteja implementado.', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns(('.dart'), vault_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Protect and optimize the app's revenue streams."
