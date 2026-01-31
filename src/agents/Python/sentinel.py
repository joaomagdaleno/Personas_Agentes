from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class SentinelPersona(BaseActivePersona):
    """
    Core: Security Specialist 🛡️
    Foca na identificação de vulnerabilidades, vazamento de credenciais e brechas de segurança.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Sentinel"
        self.emoji = "🛡️"
        self.role = "Security Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """
        Individualidade: Regras de segurança e proteção de dados.
        """
        logger.info(f"[{self.name}] Iniciando auditoria de segurança e vulnerabilidades...")
        
        # O Core do Sentinel: Foco em proteção
        security_rules = [
            {
                'regex': r"(password|passwd|pwd|token|api_key|secret)\s*=\s*['\"][^'\"]{5,}['\"]", 
                'issue': 'Possível credencial ou segredo hardcoded detectado. Use variáveis de ambiente.', 
                'severity': 'critical'
            },
            {
                'regex': r"eval\(.*\)", 
                'issue': 'Uso da função eval() detectado. Isso permite execução de código arbitrário e é um alto risco de segurança.', 
                'severity': 'critical'
            },
            {
                'regex': r"os\.system\(.*\)|subprocess\.Popen\(.*shell=True.*\)", 
                'issue': 'Execução de comandos de shell detectada. Risco de Injeção de Comando se as entradas não forem sanitizadas.', 
                'severity': 'high'
            },
            {
                'regex': r"http://", 
                'issue': 'Uso de protocolo HTTP inseguro detectado. Considere migrar para HTTPS.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns(('.py', '.env', '.json', '.yml', '.yaml'), security_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Secure the application by finding vulnerabilities and protecting sensitive data."