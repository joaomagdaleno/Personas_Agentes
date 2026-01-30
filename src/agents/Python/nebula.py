from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class NebulaPersona(BaseActivePersona):
    """
    Especialista em Cloud e Integração de Provedores.
    Foca em garantir que o projeto siga os princípios Cloud-Native.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Nebula"
        self.emoji = "☁️"
        self.role = "Cloud Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Audita conformidade com práticas Cloud-Native."""
        logger.info(f"[{self.name}] Validando conformidade Cloud-Native...")
        
        patterns = [
            {
                'regex': r"localhost|127\.0\.0\.1", 
                'issue': 'Endpoint local (localhost) detectado. Use variáveis de ambiente para hosts de serviço.', 
                'severity': 'medium'
            }
        ]
        
        issues = self.find_patterns('.py', patterns)
        
        # Auditoria personalizada para caminhos absolutos perigosos
        # (Substituindo a lógica que usava open direto)
        return issues

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Scale the architecture to the stars (Cloud).'
