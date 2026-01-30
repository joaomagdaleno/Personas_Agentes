from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class ScribePersona(BaseActivePersona):
    """Especialista em documentação Python do Personas Agentes.
    Foca na clareza do código, comentários significativos e docstrings.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Scribe."""
        super().__init__(project_root)
        self.name = "Scribe"
        self.emoji = "✍️"
        self.role = "Documentation Specialist"
        self.mission = "Ensure code clarity, standard docstrings and documentation integrity."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em presença de docstrings e clareza de funções."""
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
                            
                        # Detecta funções sem docstring (simplificado)
                        # Busca por def seguido de nova linha sem docstring logo abaixo
                        lines = content.split('\n')
                        for i, line in enumerate(lines):
                            if line.strip().startswith("def ") and i + 1 < len(lines):
                                next_line = lines[i+1].strip()
                                if '"""' not in next_line and "'''" not in next_line:
                                    issues.append({
                                        'file': rel_path, 
                                        'issue': f'Função sem docstring detectada (Linha {i+1}).', 
                                        'severity': 'low', 
                                        'context': 'Documentation'
                                    })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'