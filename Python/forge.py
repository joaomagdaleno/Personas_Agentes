from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class ForgePersona(BaseActivePersona):
    """Especialista em automação de build e scripts Python do Personas Agentes."""
    
    def __init__(self, project_root):
        """Inicializa a persona Forge."""
        super().__init__(project_root)
        self.name = "Forge"
        self.emoji = "🔨"
        self.role = "Build Specialist"
        self.mission = "Automate internal build processes and CI/CD scripts."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em scripts de build e automação."""
        issues = []
        if not self.project_root:
            return []
            
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build', 'node_modules', '__pycache__', 'venv']]
            for file in files:
                # Audita scripts de automação comuns
                if file.endswith(('.ps1', '.sh', '.py', '.bat')):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    try:
                        content = self.read_project_file(rel_path)
                        if not content:
                            continue
                            
                        # Detecta scripts que lidam com erros mas não usam blocos de proteção
                        if 'error' in content.lower() and 'try' not in content.lower() and 'trap' not in content.lower():
                            issues.append({
                                'file': rel_path, 
                                'issue': 'Script de automação sem tratamento formal de erro (try/trap).', 
                                'severity': 'medium', 
                                'context': 'Automation'
                            })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'