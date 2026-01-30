from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class MantraPersona(BaseActivePersona):
    """Especialista em excelência Pythonica do Personas Agentes.
    Guardião dos padrões de arquitetura e herança formal.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Mantra."""
        super().__init__(project_root)
        self.name = "Mantra"
        self.emoji = "🐍"
        self.role = "Self-Healing Specialist"
        self.mission = "Guardian of Pythonic excellence and architectural standards."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em herança formal e métodos abstratos."""
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
                            
                        # Detecta Personas que usam a Base mas não importam abc/abstractmethod (herança incompleta)
                        if "BaseActivePersona" in content and "abstractmethod" not in content:
                            if "class " in content and "Persona" in content and "mantra.py" not in rel_path:
                                issues.append({
                                    'file': rel_path, 
                                    'issue': 'Persona sem herança formal ou métodos abstratos detectada.', 
                                    'severity': 'medium', 
                                    'context': 'Architecture'
                                })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'