from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class SentinelPersona(BaseActivePersona):
    """
    Especialista em segurança e integridade de dados.
    Atua na linha de frente para prevenir a exposição de segredos e falhas críticas.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Sentinel"
        self.emoji = "🛡️"
        self.role = "Security Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Audita segredos hardcoded e vulnerabilidades comuns."""
        logger.info(f"[{self.name}] Iniciando varredura de segurança...")
        
        patterns = [
            {
                'regex': r"password\s*=\s*['\"]:.+['\"]|api_key\s*=\s*['\"]:.+['\"]", 
                'issue': 'Possível credencial (senha ou chave) hardcoded detectada. Use variáveis de ambiente.', 
                'severity': 'high'
            },
            {
                'regex': r"eval\(", 
                'issue': 'Uso da função perigosa eval() detectado. Risco potencial de execução de código arbitrário.', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns('.py', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Guard the codebase against vulnerabilities and leaks.'
