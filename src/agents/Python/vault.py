from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class VaultPersona(BaseActivePersona):
    """
    Core: Monetization Specialist 💎
    Foca na gestão de pagamentos, assinaturas e integridade financeira.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Vault"
        self.emoji = "💎"
        self.role = "Monetization Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando fluxos de pagamento e integridade financeira...")
        
        vault_rules = [
            {
                'regex': r"price\s*=\s*[0-9]+", 
                'issue': 'Preço hardcoded detectado. Prefira buscar valores de um serviço de catálogo ou banco de dados.', 
                'severity': 'medium'
            },
            {
                'regex': r"stripe\.Charge\.create|paypal", 
                'issue': 'Integração de pagamento detectada. Garanta o uso de webhooks para confirmação segura de transações.', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns(('.py'), vault_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Protect financial integrity and ensure a frictionless billing experience."