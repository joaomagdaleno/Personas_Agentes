from persona_base import BaseActivePersona
import os
import logging

logger = logging.getLogger(__name__)

class NeuralPersona(BaseActivePersona):
    """Especialista em inteligência Flutter do Personas Agentes."""
    
    def __init__(self, project_root):
        """Inicializa a persona Neural."""
        super().__init__(project_root)
        self.name = "Neural"
        self.emoji = "🧠"
        self.role = "AI Integration Specialist"
        self.mission = "Integrate intelligent systems and LLMs into Flutter projects."
        self.stack = "Flutter"

    def perform_audit(self) -> list:
        """Audita chamadas de API de IA e segurança de chaves em código Flutter."""
        issues = []
        if not self.project_root:
            return []
            
        for root, dirs, files in os.walk(self.project_root):
            dirs[:] = [d for d in dirs if d not in ['.git', 'build', '.dart_tool', 'node_modules']]
            for file in files:
                if file.endswith('.dart'):
                    rel_path = os.path.relpath(os.path.join(root, file), self.project_root)
                    try:
                        content = self.read_project_file(rel_path)
                        if not content:
                            continue
                            
                        if "apiKey" in content.lower() and ("gemini" in content.lower() or "openai" in content.lower()):
                            issues.append({
                                'file': rel_path, 
                                'issue': 'Possível chave de API de IA exposta no código Dart.', 
                                'severity': 'high', 
                                'context': 'Security/AI'
                            })
                    except Exception as e:
                        logger.error(f"Erro ao auditar {rel_path}: {e}")
                        
        return issues

    def get_system_prompt(self):
        """Retorna o guia de conduta para o Gemini CLI, incluindo parâmetros de LLM."""
        return (
            f'You are "{self.name}" {self.emoji}. Focus on merging software engineering with AI.\n'
            'Always use temperature=0.2 for technical tasks and temperature=0.7 for creative brainstorming.'
        )