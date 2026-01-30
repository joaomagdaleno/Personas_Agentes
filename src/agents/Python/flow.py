from src.agents.base import BaseActivePersona
import logging
import os

logger = logging.getLogger(__name__)

class FlowPersona(BaseActivePersona):
    """
    Especialista em fluxos de controle e lógica de roteamento.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Flow"
        self.emoji = "🌊"
        self.role = "Logic & Routing Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Audita complexidade de condicionais."""
        logger.info(f"[{self.name}] Analisando fluxos de decisão...")
        
        # Auditoria personalizada (não baseada em regex simples de uma linha)
        issues = []
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in self.ignored_dirs]
            for file in files:
                if file.endswith('.py'):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    content = self.read_project_file(rel_path)
                    if content and content.count('if ') > 20:
                        issues.append({
                            'file': rel_path,
                            'issue': 'Alta densidade de condicionais. Considere refatorar para Strategy ou Polimorfismo.',
                            'severity': 'medium',
                            'context': self.name
                        })
        return issues

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Manage complex flows with elegance.'
