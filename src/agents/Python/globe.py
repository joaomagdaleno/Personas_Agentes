from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class GlobePersona(BaseActivePersona):
    """
    Especialista em internacionalização e localização.
    Foca em eliminar strings hardcoded e garantir suporte multi-idioma.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Globe"
        self.emoji = "🌎"
        self.role = "i18n & Localization Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Busca strings hardcoded que deveriam estar em arquivos de tradução."""
        logger.info(f"[{self.name}] Analisando strings hardcoded...")
        
        # Padrões para detectar textos que provavelmente deveriam ser traduzidos
        patterns = [
            {
                'regex': r"print\(.*\)", 
                'issue': 'Uso de print direto detectado. Verifique se o texto deve ser internacionalizado.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns('.py', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Prepare the codebase for global accessibility.'