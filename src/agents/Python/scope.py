from src.agents.base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class ScopePersona(BaseActivePersona):
    """
    Especialista em escopo e especificações técnicas.
    Garante que o projeto tenha uma visão clara e limites bem definidos.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Scope"
        self.emoji = "🔭"
        self.role = "Requirements Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Verifica a presença de documentos de especificação básica."""
        logger.info(f"[{self.name}] Validando limites de escopo...")
        
        issues = []
        if not os.path.exists(os.path.join(self.project_root, 'auto_healing_mission.md')) and \
           not os.path.exists(os.path.join(self.project_root, 'README.md')):
            issues.append({
                'file': 'root',
                'issue': 'Nenhuma diretriz de missão ou README encontrada. Risco de desvio de escopo.',
                'severity': 'medium',
                'context': self.name
            })
            
        return issues

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Maintain the technical alignment and spec integrity.'
