from persona_base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class BoltPersona(BaseActivePersona):
    """Especialista em performance Flutter do Personas Agentes."""
    
    def __init__(self, project_root):
        """Inicializa a persona Bolt."""
        super().__init__(project_root)
        self.name = "Bolt"
        self.emoji = "⚡"
        self.role = "Performance Specialist"
        self.mission = "Optimize execution speed and UI smoothness in Flutter."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita problemas de performance (jank) no código Flutter."""
        logger.info(f"Iniciando auditoria de performance Flutter em: {self.project_root}")
        
        patterns = [
            {
                'regex': r"setState\(.*\).*for ", 
                'issue': 'Potencial jank: setState detectado próximo a loop ou lógica iterativa.', 
                'severity': 'high'
            },
            {
                'regex': r"for .*setState", 
                'issue': 'setState detectado dentro de loop (risco crítico de performance).', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns_in_files('.dart', patterns)

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI."""
        return f'You are "{self.name}" {self.emoji} - {self.role}. Focus on Flutter rendering performance and frame stability.'