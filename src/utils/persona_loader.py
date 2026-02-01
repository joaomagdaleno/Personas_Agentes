import importlib.util
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class PersonaLoader:
    """Especialista em Mobilização: Carrega e valida a junta de PhDs do disco."""
    
    @staticmethod
    def mobilize_all(target_project_root, orchestrator):
        """Varre todos os diretórios de stacks e mobiliza os PhDs correspondentes."""
        engine_root = Path(__file__).parent.parent
        agents_base = engine_root / "agents"
        
        count = 0
        # Varre subdiretórios de stacks (Python, Flutter, Kotlin)
        for stack_dir in agents_base.iterdir():
            if not stack_dir.is_dir() or stack_dir.name in ["__pycache__", "Support"]:
                continue
                
            for f in stack_dir.glob("*.py"):
                if f.name == "__init__.py": continue
                try:
                    module_name = f"{stack_dir.name}_{f.stem}"
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
