import importlib.util
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class PersonaLoader:
    """Especialista em Mobilização: Carrega e valida a junta de PhDs do disco."""
    
    @staticmethod
    def mobilize_all(target_project_root, orchestrator):
        """
        Varre o diretório interno de agentes da ferramenta e injeta as personas no orquestrador
        para auditar o projeto alvo.
        """
        # Define o caminho dos agentes relativo a este arquivo (utils/../agents/Python)
        engine_root = Path(__file__).parent.parent
        agents_dir = engine_root / "agents" / "Python"
        
        count = 0
        if not agents_dir.exists():
            logger.error(f"❌ Repositório de PhDs não encontrado em {agents_dir}")
            return 0

        for f in agents_dir.glob("*.py"):
            if f.name == "__init__.py": continue
            try:
                module_name = f.stem
                spec = importlib.util.spec_from_file_location(module_name, f)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                for attr in dir(module):
                    if attr.endswith("Persona") and attr != "BaseActivePersona":
                        persona_cls = getattr(module, attr)
                        # A persona é instanciada com o root do projeto ALVO
                        orchestrator.add_persona(persona_cls(target_project_root))
                        count += 1
            except Exception as e:
                logger.error(f"❌ Falha ao mobilizar {f.name}: {e}")
        return count
