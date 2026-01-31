from src.agents.base import BaseActivePersona
import os
import subprocess
import logging

logger = logging.getLogger(__name__)

class HermesPersona(BaseActivePersona):
    """Core: DevOps Specialist 📦"""
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Hermes"
        self.emoji = "📦"
        self.role = "DevOps Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Analisando integridade do repositório...")
        
        devops_rules = [
            {
                'regex': r"^<<<<<<< ", 
                'issue': 'Conflito de Merge detectado.', 
                'severity': 'critical'
            },
            {
                'regex': r"SECRET_KEY\s*=\s*", 
                'issue': 'Possível Secret Key exposta.', 
                'severity': 'high'
            },
            {
                'regex': r"DEBUG\s*=\s*True", 
                'issue': 'DEBUG=True detectado.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.py', '.env'), devops_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}."
