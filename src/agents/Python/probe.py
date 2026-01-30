from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class ProbePersona(BaseActivePersona):
    """
    Especialista em diagnósticos e depuração.
    Foca em identificar falhas de tratamento de erro e bugs silenciosos.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Probe"
        self.emoji = "🕵️"
        self.role = "Diagnostics Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Audita práticas de tratamento de exceção perigosas."""
        logger.info(f"[{self.name}] Iniciando varredura de diagnósticos...")
        
        patterns = [
            {
                'regex': r"except:\s*pass|except Exception:\s*pass", 
                'issue': 'Captura de erro silenciosa (pass). Prática perigosa que esconde a causa raiz de bugs.', 
                'severity': 'high'
            },
            {
                'regex': r"except.*:\s*print\(e\)", 
                'issue': 'Uso de print() em bloco except. Use logger.exception() para capturar o stack trace completo.', 
                'severity': 'medium'
            }
        ]
        
        return self.find_patterns('.py', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Reveal the hidden flaws and ensure transparency in error reporting.'
