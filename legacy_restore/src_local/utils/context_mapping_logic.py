"""
SISTEMA DE PERSONAS AGENTES - UTILS
Módulo: Lógica de Mapeamento de Contexto (ContextMappingLogic)
Função: Processamento massivo de arquivos para o Cérebro Semântico.
"""
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class ContextMappingLogic:
    def process_batch(self, scanner, engine):
        """Executa a varredura e registro em lote."""
        import time
        start_time = time.time()
        
        analyzable = scanner.get_analyzable_files()
        content_cache = self._pre_read_files(analyzable, engine.project_root)
        
        for path_str in content_cache.keys():
            engine._register_file(Path(engine.project_root / path_str))
            
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_time, "Telemetry: Context batch processing")
        return content_cache

    def _pre_read_files(self, files_iterator, root):
        cache = {}
        for path in files_iterator:
            try:
                rel = path.relative_to(root).as_posix()
                cache[rel] = path.read_text(encoding='utf-8', errors='ignore')
            except Exception as e:
                logger.warning(f"Failed to read {path}: {e}")
                continue
        return cache

    def get_initial_info(self, path, rel_path, analyst):
        comp_type = analyst.map_component_type(rel_path)
        return {
            "purpose": "Logic", "functions": [], "classes": [],
            "brittle": False, "silent_error": False, "has_test": False,
            "component_type": comp_type, 
            "domain": "EXPERIMENTATION" if comp_type == "TEST" else "PRODUCTION", 
            "path": str(path), "rel_path": rel_path
        }
