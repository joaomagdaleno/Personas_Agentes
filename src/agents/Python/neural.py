from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class NeuralPersona(BaseActivePersona):
    """
    Especialista em AI e Engenharia de Prompt.
    Garante a integração ética e eficiente de sistemas inteligentes.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Neural"
        self.emoji = "🧠"
        self.role = "AI Engineer"
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Audita integrações de LLM e segurança de prompts."""
        logger.info(f"[{self.name}] Analisando componentes de inteligência...")
        
        patterns = [
            {
                'regex': r"openai\.|gemini\.|anthropic\.", 
                'issue': 'Chamada direta a SDK de IA detectada. Verifique se o retry-logic e timeouts estão configurados.', 
                'severity': 'medium'
            },
            {
                'regex': r"temperature\s*=\s*[01]\.?\d*", 
                'issue': 'Parâmetro de temperatura exposto. Certifique-se de que está adequado ao contexto (Criatividade vs Precisão).', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns('.py', patterns)

    def get_system_prompt(self):
        return f'You are "{self.name}" {self.emoji}. Mission: Merge biological-like logic with software precision.'
