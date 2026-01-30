from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class EchoPersona(BaseActivePersona):
    """Especialista em feedback e UX Python do Personas Agentes.
    Foca em garantir que o usuário receba respostas claras do sistema.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Echo."""
        super().__init__(project_root)
        self.name = "Echo"
        self.emoji = "🗣️"
        self.role = "Success & Feedback Specialist"
        self.mission = "User experience and feedback loops."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em feedback e UX."""
        issues = []
        if not self.project_root:
            return []
            
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build', 'node_modules', '__pycache__', 'venv']]
            for file in files:
                if file.endswith('.py'):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    try:
                        content = self.read_project_file(rel_path)
                        if not content:
                            continue
                            
                        if "input(" in content and "print(" not in content and "logging" not in content:
                            issues.append({
                                'file': rel_path, 
                                'issue': 'Interação com usuário (input) sem feedback visual ou log detectado.', 
                                'severity': 'low', 
                                'context': 'UX'
                            })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'