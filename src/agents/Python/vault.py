from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class VaultPersona(BaseActivePersona):
    """
    Especialista em segurança de credenciais e lógica de negócios sensível.
    Protege o "cofre" de segredos e regras de faturamento do projeto.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Vault"
        self.emoji = "💎"
        self.role = "Revenue & Secrets Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Audita vazamento de chaves e lógica de monetização."""
        logger.info(f"[{self.name}] Protegendo o cofre de ativos...")
        
        patterns = [
            {
                'regex': r"stripe|paypal|gateway", 
                'issue': 'Lógica de pagamento detectada. Verifique se as URLs de sandbox/produção estão parametrizadas.', 
                'severity': 'medium'
            },
            {
                'regex': r"apiKey\s*=\s*['\"]?.*['\"]?", 
                'issue': 'Chave de API em texto puro detectada. Use gerenciadores de segredos ou variáveis de ambiente.', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns('.py', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Guard the credentials and ensure the integrity of the revenue stream.'
