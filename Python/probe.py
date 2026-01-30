from persona_base import BaseActivePersona
import os
import logging
import re

logger = logging.getLogger(__name__)

class ProbePersona(BaseActivePersona):
    """Especialista em diagnóstico Python do Personas Agentes.
    Foca em transparência de erros e detecção de bugs silenciosos.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Probe."""
        super().__init__(project_root)
        self.name = "Probe"
        self.emoji = "🕵️"
        self.role = "Debug & Diagnostics Specialist"
        self.mission = "Hunt for deep bugs, silent errors and execution bottlenecks."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em práticas de tratamento de exceções."""
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
                            
                        # Detecta captura de erro silenciosa (except sem ação ou com print genérico)
                        # Busca por except: ou except Exception: seguidos de pass ou print
                        silent_patterns = [
                            r"except.*:\s+pass",
                            r"except.*:\s+print\(e\)",
                            r"except.*:\s+print\(str\(e\)\)"
                        ]
                        for pattern in silent_patterns:
                            if re.search(pattern, content):
                                issues.append({
                                    'file': rel_path, 
                                    'issue': 'Captura de erro silenciosa detectada (pass/print). Use logger.exception.', 
                                    'severity': 'medium', 
                                    'context': 'Diagnostics'
                                })
                                break
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'