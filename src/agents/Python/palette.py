from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class PalettePersona(BaseActivePersona):
    """
    Core: UX & Accessibility Specialist 🎨
    Foca na experiência do usuário, padrões de design e acessibilidade.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Palette"
        self.emoji = "🎨"
        self.role = "UX Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """
        Individualidade: Regras de UX e Design Patterns.
        """
        logger.info(f"[{self.name}] Iniciando auditoria de UX e interface...")
        
        # O Core do Palette: Foco na interação com o humano
        ux_rules = [
            {
                'regex': r"input\(", 
                'issue': 'Uso de input() direto detectado. Para uma melhor UX CLI, considere usar bibliotecas como "questionary" ou "click".',
                'severity': 'low'
            },
            {
                'regex': r"color\s*=\s*['\"][^'\"]*['\"]", # Busca definições de cores hardcoded
                'issue': 'Cores hardcoded detectadas. Considere usar um sistema de temas para garantir consistência visual.', 
                'severity': 'low'
            },
            {
                'regex': r"aria-label\s*=\s*['\"][^'\"]*['\"]", # HTML/Web embutido
                'issue': 'Atributo aria-label vazio detectado. Isso quebra a acessibilidade para leitores de tela.', 
                'severity': 'high'
            }
        ]
        
        return self.find_patterns(('.py', '.html', '.css'), ux_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Ensure a delightful, consistent, and accessible user experience."