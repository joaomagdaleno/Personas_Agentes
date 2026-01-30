from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class MantraPersona(BaseActivePersona):
    """
    Especialista em excelência arquitetural.
    Guardião do contrato BaseActivePersona e padrões OOP.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Mantra"
        self.emoji = "🐍"
        self.role = "Architecture Guardian"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Audita a própria estrutura dos agentes para garantir conformidade OOP."""
        logger.info(f"[{self.name}] Validando conformidade arquitetural...")
        
        patterns = [
            {
                'regex': r"class .*Persona(?!\(BaseActivePersona\))", 
                'issue': 'Persona detectada sem herança formal da classe base (BaseActivePersona). Violatão de contrato.', 
                'severity': 'high'
            },
            {
                'regex': r"import print", # Caso alguém tente importar print por algum motivo estranho
                'issue': 'Padrão não Pythonico ou redundante detectado.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns('.py', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Maintain the project technical soul and OOP integrity.'
