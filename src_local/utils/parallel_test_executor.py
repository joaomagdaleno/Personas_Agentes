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
        # Limita workers para evitar travamento em máquinas com poucos cores
        cpu_count = os.cpu_count() or 4
        max_workers = max(1, cpu_count - 1)
        
        # Otimização PhD: Agrupa testes em lotes para reduzir overhead de criação de processos
        batch_size = max(1, len(test_files) // (max_workers * 2))
        batches = [test_files[i:i + batch_size] for i in range(0, len(test_files), batch_size)]
        
        logger.info(f"🏎️ [Executor] Acelerando {len(test_files)} testes em {len(batches)} lotes (Workers: {max_workers})...")

        results = []
        with ProcessPoolExecutor(max_workers=max_workers) as executor:
            stop_event = None # No simple way to share stop event in process pool without manager, skipping complexity for now
            futures = {executor.submit(self._run_test_batch, batch, project_root): batch for batch in batches}
            for future in as_completed(futures):
                try:
                    results.extend(future.result())
                except Exception as e:
                    logger.error(f"❌ Erro no lote de testes: {e}")

        return results

    def _run_test_batch(self, test_files: list, project_root: str) -> list:
        """Executa um lote de arquivos de teste em um único processo."""
        # Re-import needed inside process
        import subprocess 
        import sys
        
        batch_results = []
        for test_file in test_files:
            try:
                # Usa subprocesso isolado para garantir que vazamentos de memória/estado não afetem o worker
                res = subprocess.run(
                    [sys.executable, "-m", "unittest", str(test_file)],
                    capture_output=True, text=True, cwd=str(project_root),
                    encoding='utf-8', errors='ignore'
                )
                
                # Parsing simplificado para não duplicar lógica (idealmente TestRunner faria isso, 
                # mas aqui precisamos retornar info estruturada do worker)
                is_success = res.returncode == 0
                batch_results.append({
                    "file": str(test_file),
                    "success": is_success, 
                    "raw_output": res.stderr,
                    "total_run": 1 if is_success else 0, # Estimativa bruta se não parsear stderr
                    "failed": 0 if is_success else 1
                })
            except Exception as e:
                batch_results.append({"success": False, "failed": 1, "total_run": 1, "error": str(e)})
        return batch_results
