from persona_base import BaseActivePersona
import logging

logger = logging.getLogger(__name__)

class DirectorPersona(BaseActivePersona):
    """Diretor 🏛️ - O Arquiteto Mestre Autônomo e Líder da CLI.
    Coordena outros agentes e define a estratégia de reparo do projeto.
    """
    
    def __init__(self, project_root=None):
        """Inicializa o Diretor com o diretório raiz do projeto."""
        super().__init__(project_root)
        self.name = "Director"
        self.emoji = "🏛️"
        self.role = "The Autonomous Master Architect and CLI Lead"
        self.mission = "To drive specialized personas to execute real actions and ensure project quality."
        self.stack = "Global"

    def perform_audit(self) -> list:
        """O Diretor realiza auditorias de alto nível sobre a saúde do projeto."""
        logger.info("Diretor iniciando auditoria estratégica...")
        # Placeholder para auditorias estratégicas futuras
        return []

    def get_system_prompt(self) -> str:
        """Retorna o prompt de sistema definitivo para o Diretor."""
        return (
            f'You are "{self.name}" {self.emoji} - {self.role}.\n'
            f'Mission: {self.mission}\n'
            'Your primary goal is to orchestrate specialized agents and provide high-level technical guidance.'
        )