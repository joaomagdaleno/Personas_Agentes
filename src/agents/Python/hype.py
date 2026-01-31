from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class HypePersona(BaseActivePersona):
    """
    Core: Growth Engineering Specialist 📣
    Foca em otimização de busca (SEO), metadados e engenharia de crescimento.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Hype"
        self.emoji = "📣"
        self.role = "Growth Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Analisando metadados e gatilhos de crescimento...")
        
        hype_rules = [
            {
                'regex': r"<title>.*</title>", # SEO Básico
                'issue': 'Tags de título detectadas. Garanta que sejam dinâmicas e otimizadas para SEO.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.py', '.html'), hype_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Optimize for discovery and user acquisition."