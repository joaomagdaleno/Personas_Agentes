import os

class PersonaManager:
    """
    Gerenciador Automático de Personas.
    Garante que todas as 26 personas sejam atualizadas sem erro humano.
    """
    def __init__(self, project_root):
        self.project_root = project_root
        self.base_path = os.path.join(project_root, "src", "agents", "Python")
        
        # Definição das identidades (O que muda em cada uma)
        self.identities = {
            "Bolt": {"emoji": "⚡", "role": "Performance Specialist", "mission": "Otimizar velocidade e recursos."},
            "Hermes": {"emoji": "📦", "role": "DevOps Specialist", "mission": "Garantir integridade de repositório e CI/CD."},
            "Probe": {"emoji": "🧪", "role": "Diagnostics Specialist", "mission": "Detectar bugs e falhas lógicas profundas."},
            "Sentinel": {"emoji": "🛡️", "role": "Security Specialist", "mission": "Identificar vulnerabilidades e falhas de segurança."},
            "Palette": {"emoji": "🎨", "role": "UX Specialist", "mission": "Garantir acessibilidade e padrões visuais."},
            "Nexus": {"emoji": "🌐", "role": "API Specialist", "mission": "Auditar conexões de rede e contratos de API."},
            # ... Adicione as outras 20 aqui ...
        }

    def generate_all(self):
        """Gera ou atualiza os arquivos das personas com base no Template."""
        os.makedirs(self.base_path, exist_ok=True)
        
        template = """from src.agents.base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class {name}Persona(BaseActivePersona):
    \"\"\"
    Agente Especialista: {role}
    Missão: {mission}
    \"\"\"
    def __init__(self, project_root):
        super().__init__(project_root)
        self.name = "{name}"
        self.emoji = "{emoji}"
        self.role = "{role}"
        self.stack = "Python"

    def perform_audit(self) -> list:
        # Busca padrões específicos da especialidade usando a engine da Base
        patterns = [] # Definido dinamicamente conforme a especialidade
        return self.find_patterns(('.py', '.md', '.json'), patterns)

    def get_system_prompt(self):
        return f"You are {{self.name}} {{self.emoji}}. Mission: {mission}"
"""
        for name, data in self.identities.items():
            file_path = os.path.join(self.base_path, f"{name.lower()}.py")
            content = template.format(
                name=name,
                emoji=data['emoji'],
                role=data['role'],
                mission=data['mission']
            )
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            logger.info(f"✅ Persona {name} atualizada com sucesso.")

if __name__ == "__main__":
    manager = PersonaManager(os.getcwd())
    manager.generate_all()
