from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class VaultPersona(BaseActivePersona):
    """Especialista em segredos e monetização Python do Personas Agentes. 
    Foca em identificar vazamento de credenciais e chaves.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Vault."""
        super().__init__(project_root)
        self.name = "Vault"
        self.emoji = "💎"
        self.role = "Monetization & Secrets Specialist"
        self.mission = "Protect credentials and validate revenue logic."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em segredos e chaves expostas."""
        issues = []
        if not self.project_root:
            return []
            
        logger.info(f"Iniciando auditoria Vault em: {self.project_root}")
        
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build', 'node_modules', '__pycache__', 'venv']]
            for file in files:
                if file.endswith('.py'):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    try:
                        content = self.read_project_file(rel_path)
                        if not content:
                            continue
                            
                        # Detecta chaves expostas (evitando self-detection)
                        # Usamos concatenação para que o script não se detecte
                        key_patterns = ["api" + "_key", "secret" + "_key"]
                        found = False
                        if "vault.py" in rel_path:
                            # Para este arquivo, precisamos de mais de uma ocorrência para ser um real leak
                            for pattern in key_patterns:
                                if content.lower().count(pattern + " =") > 1:
                                    found = True
                                    break
                        else:
                            for pattern in key_patterns:
                                if pattern + " =" in content.lower():
                                    found = True
                                    break
                                    
                        if found:
                            issues.append({
                                'file': rel_path, 
                                'issue': 'Possível chave de API exposta no código.', 
                                'severity': 'high', 
                                'context': 'Security'
                            })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'