from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class NebulaPersona(BaseActivePersona):
    """
    Core: Cloud & Serverless Specialist ☁️
    Foca na infraestrutura em nuvem, escalabilidade horizontal e serviços gerenciados.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Nebula"
        self.emoji = "☁️"
        self.role = "Cloud Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando configurações de nuvem e infra...")
        
        nebula_rules = [
            {
                'regex': r"boto3\.client\(.*aws_access_key_id", 
                'issue': 'Credenciais AWS detectadas no código. Use perfis IAM ou variáveis de ambiente.', 
                'severity': 'critical'
            }
        ]
        
        return self.find_patterns(('.py', '.yml', '.yaml'), nebula_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure a scalable, secure, and cost-effective cloud infrastructure."