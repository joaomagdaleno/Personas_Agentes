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
        # Agente de Suporte ao Registro
        from src.agents.Support.registry_compiler import RegistryCompiler
        compiler_agent = RegistryCompiler()
        
        registry, total_count = compiler_agent.compile_stacks(self.base_agents_dir)

        self.registry_path.write_text(json.dumps(registry, indent=4), encoding='utf-8')
        logger.info(f"✅ Registro concluído: {total_count} PhDs ativos.")

if __name__ == "__main__":
    Compiler().compile_all()