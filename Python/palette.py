from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class PalettePersona(BaseActivePersona):
    """Especialista em UX/UI CLI Python do Personas Agentes.
    Foca na experiência visual e usabilidade do terminal.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Palette."""
        super().__init__(project_root)
        self.name = "Palette"
        self.emoji = "🎨"
        self.role = "UX & UI Specialist"
        self.mission = "Enhance CLI experience through visual formatting and rich interfaces."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em usabilidade de CLI e cores."""
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
                            
                        # Detecta falta de cores/formatação em scripts que interagem com usuário
                        if "print(" in content or "logger." in content:
                            if "\033[" not in content and "rich" not in content and "colorama" not in content:
                                issues.append({
                                    'file': rel_path, 
                                    'issue': 'Interface CLI detectada sem uso de cores ou formatação rica (ANSI/Rich).', 
                                    'severity': 'low', 
                                    'context': 'UX/UI'
                                })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'