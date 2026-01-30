from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class StreamPersona(BaseActivePersona):
    """Especialista em tempo real Python do Personas Agentes.
    Foca em comunicação bidirecional, sockets e streams de dados.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Stream."""
        super().__init__(project_root)
        self.name = "Stream"
        self.emoji = "📡"
        self.role = "Real-Time Specialist"
        self.mission = "Implement robust bidirectional communication and data streaming."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em conexões de stream e sockets."""
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
                            
                        # Detecta uso de sockets ou websockets sem aparente tratamento de fechamento
                        if "socket" in content or "websocket" in content:
                            if "close()" not in content and "on_close" not in content and "disconnect" not in content:
                                issues.append({
                                    'file': rel_path, 
                                    'issue': 'Conexão stream ou socket detectada sem fechamento explícito.', 
                                    'severity': 'high', 
                                    'context': 'RealTime'
                                })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'