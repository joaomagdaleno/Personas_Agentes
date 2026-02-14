"""
🎭 Carregador de Personas Agentes.
Responsável por instanciar e mobilizar a junta de PhDs no Orquestrador.
"""
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class PersonaLoader:
    """Mecanismo de bootstrapping para agentes técnicos."""
    
    @staticmethod
    def mobilize_all(project_root, orchestrator):
        """Mobiliza todas as personas detectadas no DNA do projeto."""
        logger.info("🎭 [Loader] Iniciando mobilização em massa de PhDs...")
        loader = PersonaLoader()
        loader.load_personas(orchestrator)

    def load_personas(self, orchestrator):
        """Carrega personas básicas para o orquestrador."""
        # Carrega personas Python (incluindo Testify)
        try:
            from src_local.agents.Python.Audit.testify import TestifyPersona
            testify = TestifyPersona(orchestrator.project_root)
            orchestrator.add_persona(testify)
            logger.debug("🎭 [Loader] Testify Persona mobilizada.")
        except Exception as e:
            logger.error(f"❌ [Loader] Falha ao carregar Testify: {e}")
