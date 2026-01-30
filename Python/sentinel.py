from persona_base import BaseActivePersona
import os
import logging
import re

logger = logging.getLogger(__name__)

class SentinelPersona(BaseActivePersona):
    """Especialista em segurança Python do Personas Agentes.
    Foca na proteção do código, prevenção de vazamentos e integridade de dados.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Sentinel."""
        super().__init__(project_root)
        self.name = "Sentinel"
        self.emoji = "🛡️"
        self.role = "Security Specialist"
        self.mission = "Secure the codebase and prevent accidental credential leaks."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em segredos expostos e vulnerabilidades comuns."""
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
                            
                        # Detecta possíveis segredos expostos (senhas, tokens)
                        # Busca por atribuições diretas de nomes suspeitos
                        patterns = [
                            r'^[ \t]*password\s*=',
                            r'^[ \t]*secret\s*=',
                            r'^[ \t]*token\s*=',
                            r'^[ \t]*api_key\s*='
                        ]
                        for pattern in patterns:
                            if re.search(pattern, content, re.M | re.I):
                                issues.append({
                                    'file': rel_path, 
                                    'issue': 'Possível segredo ou credencial exposta em variável hardcoded.', 
                                    'severity': 'high', 
                                    'context': 'Security'
                                })
                                break
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'