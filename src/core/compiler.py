import logging
import json
import time
import sys
from pathlib import Path

logger = logging.getLogger(__name__)

class Compiler:
    """Sincronizador de Censo PhD: Registra a paridade de agentes."""
    
    def __init__(self, project_root=None):
        if not project_root:
            self.project_root = Path(__file__).parent.parent.parent
        else:
            self.project_root = Path(project_root)
            
        self.registry_path = self.project_root / "agents_registry.json"
        self.base_agents_dir = self.project_root / "src" / "agents"
        
        # Garante logging apenas quando necessário
        from src.utils.logging_config import configure_logging
        configure_logging()

    def compile_all(self):
        logger.info("🚀 Sincronizando censo global de PhDs...")
        registry = {"last_sync": time.time(), "stacks": {}}
        total_count = 0
        
        for stack_dir in self.base_agents_dir.iterdir():
            if not stack_dir.is_dir() or stack_dir.name == "__pycache__":
                continue
                
            stack_name = stack_dir.name
            registry["stacks"][stack_name] = []
            
            for agent_file in stack_dir.glob("*.py"):
                if agent_file.name == "__init__.py": continue
                
                agent_info = {
                    "name": agent_file.stem,
                    "status": "STABLE"
                }
                registry["stacks"][stack_name].append(agent_info)
                total_count += 1

        self.registry_path.write_text(json.dumps(registry, indent=4), encoding='utf-8')
        logger.info(f"✅ Registro concluído: {total_count} PhDs ativos.")

if __name__ == "__main__":
    Compiler().compile_all()