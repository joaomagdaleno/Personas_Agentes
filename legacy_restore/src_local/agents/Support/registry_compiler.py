import json
import time
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class RegistryCompiler:
    """Assistente Técnico: Cartógrafo de Personas e Stacks 🗺️"""
    
    def compile_stacks(self, agents_dir: Path) -> dict:
        """Mapeia a topologia de agentes e suas capacidades."""
        registry = {"last_sync": time.time(), "stacks": {}}
        total = 0
        
        for stack_dir in agents_dir.iterdir():
            if not stack_dir.is_dir() or stack_dir.name in ["__pycache__", "Support"]:
                continue
                
            stack_name = stack_dir.name
            registry["stacks"][stack_name] = []
            
            for agent_file in stack_dir.glob("*.py"):
                if agent_file.name == "__init__.py": continue
                
                registry["stacks"][stack_name].append({
                    "name": agent_file.stem,
                    "status": "STABLE"
                })
                total += 1
                
        return registry, total
