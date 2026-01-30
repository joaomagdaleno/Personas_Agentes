from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class CachePersona(BaseActivePersona):
    """Especialista em cache e persistência Python do Personas Agentes.
    Foca em gestão de recursos e eficiência de I/O.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Cache."""
        super().__init__(project_root)
        self.name = "Cache"
        self.emoji = "🗄️"
        self.role = "Storage & Persistence Specialist"
        self.mission = "Ensure efficient data handling, caching and resource management."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em vazamento de handles de arquivos e cache."""
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
                            
                        # Detecta abertura de arquivo sem fechar (não usa 'with' e não chama '.close()')
                        if "open(" in content and "with open" not in content and ".close()" not in content:
                            issues.append({
                                'file': rel_path, 
                                'issue': 'Arquivo aberto sem fechamento detectado (Vazamento de Recurso).', 
                                'severity': 'high', 
                                'context': 'Persistence'
                            })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'