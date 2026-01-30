from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class BridgePersona(BaseActivePersona):
    """Especialista em integração nativa Python do Personas Agentes."""
    
    def __init__(self, project_root):
        """Inicializa a persona Bridge."""
        super().__init__(project_root)
        self.name = "Bridge"
        self.emoji = "🌉"
        self.role = "Native Integration Specialist"
        self.mission = "System-level and C-extension connectivity."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em integrações nativas e extensões C."""
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
                            
                        if "ctypes." in content or "cffi" in content:
                            if "try" not in content.lower():
                                issues.append({
                                    'file': rel_path, 
                                    'issue': 'Chamada nativa sem proteção try-except.', 
                                    'severity': 'high', 
                                    'context': 'Bridge'
                                })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'