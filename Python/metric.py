from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class MetricPersona(BaseActivePersona):
    """Especialista em telemetria Python do Personas Agentes.
    Foca em garantir a observabilidade através de logging e métricas.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Metric."""
        super().__init__(project_root)
        self.name = "Metric"
        self.emoji = "📊"
        self.role = "Analytics & Growth Specialist"
        self.mission = "Telemetry, logging and observability excellence."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em práticas de logging e telemetria."""
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
                            
                        # Detecta uso de print para logging (prática a ser evitada no estágio STABILITY/EVOLUTION)
                        if "print(" in content and "logging" not in content and "main_gui.py" not in rel_path:
                            issues.append({
                                'file': rel_path, 
                                'issue': 'Uso de print em vez de logging detectado (reduz observabilidade).', 
                                'severity': 'low', 
                                'context': 'Observability'
                            })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}'