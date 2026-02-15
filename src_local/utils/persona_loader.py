import importlib.util
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class PersonaLoader:
    """
    🏛️ Mobilizador de Personas PhD.
    Especialista em carregamento dinâmico de identidades soberanas do disco,
    garantindo que cada Agente PhD seja instanciado com o contexto correto.
    """
    
    @staticmethod
    def mobilize_all(target_project_root, orchestrator):
        """
        🚀 Varre os diretórios de agentes e mobiliza a junta PhD correspondente.
        Realiza a injeção atômica do Maestro em cada identidade carregada.
        """
        engine_root = Path(__file__).parent.parent
        agents_base = engine_root / "agents"
        
        count = 0
        # Varre subdiretórios de stacks (Python, Flutter, Kotlin)
        for stack_dir in agents_base.iterdir():
            if not stack_dir.is_dir() or stack_dir.name in ["__pycache__", "Support"]:
                continue
                
            # rglob para busca recursiva em todos os subdiretórios técnicos
            for f in stack_dir.rglob("*.py"):
                if f.name == "__init__.py" or "__pycache__" in str(f): continue
                try:
                    # Gera um nome de módulo único baseado no caminho relativo para evitar conflitos
                    relative_path = f.relative_to(agents_base)
                    module_name = f"{stack_dir.name}_" + "_".join(relative_path.parts[1:]).replace(".py", "")
                    
                    spec = importlib.util.spec_from_file_location(module_name, f)
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)
                    for attr in dir(module):
                        if attr.endswith("Persona") and attr != "BaseActivePersona":
                            persona_cls = getattr(module, attr)
                            orchestrator.add_persona(persona_cls(target_project_root))
                            count += 1
                except Exception as e:
                    logger.error(f"❌ Falha ao mobilizar {f.name} ({stack_dir.name}): {e}")
        return count
