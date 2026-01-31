from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class NeuralPersona(BaseActivePersona):
    """
    Core: AI & Machine Learning Specialist 🧠
    Foca na integração de modelos de inteligência artificial e processamento de dados.
    """
    
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "Neural"
        self.emoji = "🧠"
        self.role = "AI Specialist"
        self.stack = "Python"

    def perform_audit(self) -> list:
        logger.info(f"[{self.name}] Audidando pipelines de IA e integrações com modelos...")
        
        neural_rules = [
            {
                'regex': r"openai\.api_key\s*=", 
                'issue': 'Chave de API OpenAI hardcoded detectada. Risco crítico de segurança.', 
                'severity': 'critical'
            },
            {
                'regex': r"temperature\s*=\s*0", 
                'issue': 'Temperatura do modelo definida como 0. Garanta que a falta de variabilidade seja desejada para este contexto.', 
                'severity': 'low'
            }
        ]
        
        return self.find_patterns(('.py'), neural_rules)

    def get_system_prompt(self):
        return f"You are {self.name} {self.emoji}. Mission: Integrate intelligence into the core of the application."