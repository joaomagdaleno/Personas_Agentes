from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class ScalePersona(BaseActivePersona):
    """Especialista em arquitetura Python do Personas Agentes.
    Foca em modularidade, escalabilidade e organização de código.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Scale."""
        super().__init__(project_root)
        self.name = "Scale"
        self.emoji = "🏗️"
        self.role = "Architecture Specialist"
        self.mission = "Implement modularity and scalability patterns in the project."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em modularidade e tamanho de arquivos."""
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
                            
                        # Detecta arquivos excessivamente longos (problema de modularidade)
                        lines = content.split('\n')
                        if len(lines) > 500:
                            issues.append({
                                'file': rel_path, 
                                'issue': f'Arquivo muito longo ({len(lines)} linhas). Sugere-se modularização.', 
                                'severity': 'medium', 
                                'context': 'Architecture'
                            })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'