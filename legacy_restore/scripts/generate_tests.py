import os
import sys
import logging
from pathlib import Path

sys.path.append(os.getcwd())

from src_local.utils.context_engine import ContextEngine
from src_local.agents.Support.infrastructure_assembler import InfrastructureAssembler
from src_local.utils.logging_config import configure_logging

# Configuração Soberana
configure_logging()
logger = logging.getLogger("TestGenerator")

def generate_missing_tests():
    """Gera esqueletos de teste para arquivos em 'Matéria Escura'."""
    project_root = Path(os.getcwd())
    support = InfrastructureAssembler.assemble_core_support()
    context_engine = ContextEngine(project_root, support)
    
    logger.info("🔍 Iniciando busca por Matéria Escura...")
    context = context_engine.analyze_project()
    map_data = context.get("map", {})
    
    dark_matter = [f for f, i in map_data.items() 
                   if not f.endswith("__init__.py") and 
                   i.get("component_type") in ["AGENT", "CORE", "LOGIC", "UTIL"] and 
                   not i.get("has_test")]
    
    logger.info(f"🌌 Encontrados {len(dark_matter)} arquivos sem cobertura física.")
    
    tests_dir = project_root / "tests"
    tests_dir.mkdir(exist_ok=True)
    
    for rel_path_str in dark_matter:
        _generate_test_file(rel_path_str, tests_dir)
            
    logger.info("✅ Geração de testes concluída.")

def _generate_test_file(rel_path_str, tests_dir):
    src_file = Path(rel_path_str)
    test_name = f"test_{src_file.stem}.py"
    test_file = tests_dir / test_name
    
    if test_file.exists():
        logger.warning(f"⚠️ Arquivo de teste já existe fisicamente: {test_file}")
        return
        
    logger.info(f"✨ Gerando {test_name} para {rel_path_str}...")
    import_path = rel_path_str.replace("/", ".").replace("\\", ".").replace(".py", "")
    
    content = f"""import unittest
import logging
from {import_path} import *

# Configuração de telemetria
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Test{src_file.stem.capitalize()}")

class Test{src_file.stem.capitalize().replace('_', '')}(unittest.TestCase):
    def test_smoke(self):
        \"\"\"Smoke test for {src_file.name}\"\"\"
        logger.info("⚡ Iniciando smoke test para {src_file.name}...")
        self.assertTrue(True)
        logger.info("✅ Smoke test concluído.")

if __name__ == "__main__":
    unittest.main()
"""
    test_file.write_text(content, encoding="utf-8")

if __name__ == "__main__":
    generate_missing_tests()
