from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class NeuralPersona(BaseActivePersona):
    """Especialista em IA Python do Personas Agentes.
    Foca em integração de LLMs e lógica de Machine Learning.
    """
    
    def __init__(self, project_root):
        """Inicializa a persona Neural."""
        super().__init__(project_root)
        self.name = "Neural"
        self.emoji = "🧠"
        self.role = "AI & Machine Learning Specialist"
        self.mission = "Implement AI-driven features and robust LLM logic."
        self.stack = "Python"

    def perform_audit(self) -> list:
        """Realiza auditoria técnica focada em integrações de IA e configurações de LLM."""
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
                            
                        # Detecta integrações de LLM sem definição de parâmetros cruciais
                        if "openai" in content or "gemini" in content or "anthropic" in content:
                            if "temperature" not in content:
                                issues.append({
                                    'file': rel_path, 
                                    'issue': 'Configuração de LLM detectada sem definição explícita de temperatura.', 
                                    'severity': 'low', 
                                    'context': 'AI/LLM'
                                })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o prompt de sistema da persona, incluindo diretrizes de modelo."""
        return (
            f'You are "{self.name}" {self.emoji} - {self.role}. Mission: {self.mission}\n'
            'Always verify LLM parameters like temperature and max_tokens for reliability.'
        )