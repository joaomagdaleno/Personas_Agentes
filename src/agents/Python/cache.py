from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class CachePersona(BaseActivePersona):
    """
    Especialista em gestão de recursos e persistência.
    Foca em prevenir vazamentos de memória e handles de arquivos.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Cache"
        self.emoji = "🗄️"
        self.role = "Persistence Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Audita vazamentos de recursos (arquivos abertos)."""
        logger.info(f"[{self.name}] Verificando gestão de recursos...")
        
        patterns = [
            {
                # Busca por open() que não seja precedido por 'with' nem seguido por '.close()'
                # Simplificado para o motor de busca genérico
                'regex': r"^(?!.*with).*open\(", 
                'issue': 'Abertura de arquivo sem context manager (with). Risco de vazamento de handle.', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns('.py', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Efficient data handling and resource protection.'
