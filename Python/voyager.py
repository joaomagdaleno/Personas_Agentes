from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class VoyagerPersona(BaseActivePersona):
    """Especialista em inovação Python do Personas Agentes. 
    Foca em identificar tecnologias obsoletas e sugerir upgrades.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Voyager."""
        super().__init__(project_root)
        self.name = "Voyager"
        self.emoji = "🚀"
        self.role = "Innovation Specialist"
        self.mission = "New features, exploration and legacy modernization."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em identificar legado (como Python 2)."""
        issues = []
        if not self.project_root:
            return []
            
        logger.info(f"Iniciando auditoria Voyager em: {self.project_root}")
        
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build', 'node_modules', '__pycache__', 'venv']]
            for file in files:
                if file.endswith('.py'):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    try:
                        content = self.read_project_file(rel_path)
                        if not content:
                            continue
                            
                        # Detecta referência a Python 2 (evitando self-detection)
                        if "python" + "2" in content.lower():
                            # Se for este próprio arquivo, ignorar
                            if "voyager.py" in rel_path:
                                # Checa se tem mais de uma ocorrência ou se é apenas a lógica
                                if content.lower().count("python" + "2") > 1:
                                    issues.append({
                                        'file': rel_path, 
                                        'issue': 'Referência a Python 2 detectada. Vamos atualizar para o futuro?', 
                                        'severity': 'medium', 
                                        'context': 'Innovation'
                                    })
                            else:
                                issues.append({
                                    'file': rel_path, 
                                    'issue': 'Referência a Python 2 detectada. Vamos atualizar para o futuro?', 
                                    'severity': 'medium', 
                                    'context': 'Innovation'
                                })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'