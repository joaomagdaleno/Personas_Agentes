from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class NexusPersona(BaseActivePersona):
    """Especialista em APIs Python do Personas Agentes.
    Foca em integração de serviços externos e robustez de rede.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Nexus."""
        super().__init__(project_root)
        self.name = "Nexus"
        self.emoji = "🌐"
        self.role = "API Integration Specialist"
        self.mission = "Implement reliable networking and external service connectivity."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em chamadas de API e resiliência de rede."""
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
                            
                        # Detecta chamadas HTTP síncronas sem timeout (causa hang indefinido)
                        if "requests." in content and (".get(" in content or ".post(" in content or ".put(" in content):
                            if "timeout=" not in content:
                                issues.append({
                                    'file': rel_path, 
                                    'issue': 'Chamada HTTP (requests) sem timeout definido (Risco de bloqueio).', 
                                    'severity': 'high', 
                                    'context': 'Networking'
                                })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'