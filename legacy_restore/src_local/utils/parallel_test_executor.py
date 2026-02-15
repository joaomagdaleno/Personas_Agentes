import logging
import time
import os
import subprocess
import sys
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

logger = logging.getLogger(__name__)

class ParallelTestExecutor:
    """🚀 Executor Paralelo de Testes."""

    def run_parallel(self, project_root: str, test_files: list) -> list:
        # Arquitetura de Estabilidade Total: 2 Blocos Estáticos
        # Minimiza a comunicação entre processos que causa travamentos no Windows/i5
        max_workers = 2
        
        # Divide a lista em apenas 2 metades
        mid = (len(test_files) + 1) // 2
        batches = [test_files[:mid], test_files[mid:]]
        batches = [b for b in batches if b] # Remove lotes vazios se houver poucos testes
        
        logger.info(f"🏎️ [Executor] Executando {len(test_files)} testes em 2 blocos fixos (Workers: {max_workers})...")

        results = []
        abs_root = str(Path(project_root).resolve())
        
        with ProcessPoolExecutor(max_workers=max_workers) as executor:
            futures = {executor.submit(self._run_test_batch_in_process, batch, abs_root): i for i, batch in enumerate(batches)}
            for future in as_completed(futures):
                try:
                    res = future.result()
                    if res: results.extend(res)
                except Exception as e:
                    logger.error(f"❌ Falha crítica no bloco de testes: {e}")

        return results

    def _run_test_batch_in_process(self, test_files: list, project_root: str) -> list:
        """Executa um bloco inteiro de testes de forma serial e ultra-eficiente."""
        import unittest
        import sys
        import io
        import logging
        from pathlib import Path
        
        # Otimização Crucial: Desativa LOGGING para ganhar performance
        logging.disable(logging.CRITICAL)
        
        if project_root not in sys.path:
            sys.path.insert(0, project_root)
            
        abs_project_root = Path(project_root).resolve()
        batch_results = []
        
        module_names = []
        file_map = {}
        for f in test_files:
            try:
                rel = Path(f).resolve().relative_to(abs_project_root)
                mod = str(rel.with_suffix('')).replace(os.path.sep, '.')
                module_names.append(mod)
                file_map[mod] = f
            except: continue

        loader = unittest.TestLoader()
        # Reusa o runner e o stream para o bloco inteiro
        runner = unittest.TextTestRunner(stream=io.StringIO(), verbosity=0)
        
        for mod_name in module_names:
            try:
                suite = loader.loadTestsFromName(mod_name)
                result = runner.run(suite)
                batch_results.append({
                    "file": file_map[mod_name],
                    "success": result.wasSuccessful(), 
                    "total_run": result.testsRun,
                    "failed": len(result.failures) + len(result.errors)
                })
            except Exception:
                batch_results.append({"file": file_map.get(mod_name, "unknown"), "success": False, "failed": 1, "total_run": 1})
                
        return batch_results
