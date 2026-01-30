from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class NebulaPersona(BaseActivePersona):
    """Especialista em nuvem Python do Personas Agentes.
    Foca em infraestrutura serverless e segurança de configurações.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Nebula."""
        super().__init__(project_root)
        self.name = "Nebula"
        self.emoji = "☁️"
        self.role = "Serverless Specialist"
        self.mission = "Implement cloud infrastructure and integration best practices."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em configurações de nuvem e variáveis de ambiente."""
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
                            
                        # Detecta uso de SDKs de nuvem sem uso aparente de variáveis de ambiente
                        cloud_libs = ["boto3", "firebase", "google.cloud", "azure.storage", "supabase"]
                        if any(lib in content for lib in cloud_libs):
                            if "os.getenv" not in content and "os.environ" not in content and "load_dotenv" not in content:
                                issues.append({
                                    'file': rel_path, 
                                    'issue': 'Configurações de nuvem detectadas sem uso explícito de variáveis de ambiente.', 
                                    'severity': 'medium', 
                                    'context': 'Cloud'
                                })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'