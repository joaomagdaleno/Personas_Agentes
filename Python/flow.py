from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class FlowPersona(BaseActivePersona):
    """Especialista em fluxos de lógica Python do Personas Agentes.
    Foca em complexidade ciclomática e legibilidade de controle.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Flow."""
        super().__init__(project_root)
        self.name = "Flow"
        self.emoji = "🌊"
        self.role = "Logic & Routing Specialist"
        self.mission = "Manage complex control flows and states effectively."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em fluxos de lógica e excesso de condicionais."""
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
                            
                        # Detecta excesso de condicionais (aproximação simples de complexidade)
                        if content.count('if ') > 15:
                            issues.append({
                                'file': rel_path, 
                                'issue': 'Excesso de condicionais detectado. Considere simplificar o fluxo ou usar polimorfismo.', 
                                'severity': 'medium', 
                                'context': 'Logic'
                            })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'