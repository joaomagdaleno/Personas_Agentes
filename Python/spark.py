from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class SparkPersona(BaseActivePersona):
    """Especialista em engajamento dev Python do Personas Agentes. 
    Foca em identificar pendências (TODO/FIXME) e motivar a conclusão.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Spark."""
        super().__init__(project_root)
        self.name = "Spark"
        self.emoji = "✨"
        self.role = "Gamification Specialist"
        self.mission = "Foster engagement and social mechanics through code quality awareness."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em pendências de código."""
        issues = []
        if not self.project_root:
            return []
            
        logger.info(f"Iniciando auditoria Spark em: {self.project_root}")
        
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build', 'node_modules', '__pycache__', 'venv']]
            for file in files:
                if file.endswith('.py'):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    try:
                        content = self.read_project_file(rel_path)
                        if not content:
                            continue
                            
                        # Detecta TODO/FIXME em comentários (usando regex para evitar self-detection)
                        # Buscamos o padrão literal mas de forma que não triggue este próprio arquivo se lido
                        if "# " + "TODO" in content or "# " + "FIXME" in content:
                            issues.append({
                                'file': rel_path, 
                                'issue': 'Lembrete de tarefa detectado. Vamos concluir este Spark?', 
                                'severity': 'low', 
                                'context': 'Engagement'
                            })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'