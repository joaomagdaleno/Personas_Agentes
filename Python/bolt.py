from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class BoltPersona(BaseActivePersona):
    """Especialista em performance Python. Foca em identificar loops ineficientes e gargalos."""
    
    def __init__(self, project_root):
        """Inicializa a persona com o diretório raiz do projeto."""
        super().__init__(project_root)
        self.name = "Bolt"
        self.emoji = "⚡"
        self.role = "Performance Specialist"
        self.mission = "Optimize execution speed and resource usage."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em performance, detectando loops com sleep e outros padrões."""
        issues = []
        if not self.project_root:
            logger.warning("Project root não definido para auditoria.")
            return []
            
        logger.info(f"Iniciando auditoria de performance em: {self.project_root}")
        
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build', 'node_modules', '__pycache__', 'venv', '.env']]
            for file in files:
                if file.endswith('.py'):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    try:
                        content = self.read_project_file(rel_path)
                        if not content:
                            continue
                            
                        # Detecta Loop com sleep (pode indicar polling ineficiente)
                        if "for " in content and "time.sleep" in content:
                            issues.append({
                                'file': rel_path, 
                                'issue': 'Loop com sleep detectado (polling ineficiente).', 
                                'severity': 'medium', 
                                'context': 'Performance'
                            })
                            
                        # Detecta abertura de arquivos sem 'with'
                        if "open(" in content and "with open" not in content and ".close()" not in content:
                            issues.append({
                                'file': rel_path, 
                                'issue': 'Arquivo aberto sem context manager (with) ou fechamento explícito.', 
                                'severity': 'high', 
                                'context': 'Resource Management'
                            })
                            
                    except Exception as e:
                        logger.error(f"Erro ao auditar arquivo {rel_path}: {e}")
                        continue
                        
        logger.info(f"Auditoria concluída. {len(issues)} problemas encontrados.")
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'