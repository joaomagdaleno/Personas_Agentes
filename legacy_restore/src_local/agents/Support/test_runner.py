import subprocess
import sys
import re
import logging
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

logger = logging.getLogger(__name__)

class TestRunner:
    """
    🏎️ Executor de Testes PhD.
    O braço mecânico que valida a integridade funcional do sistema.
    """
    def __init__(self):
        self.mapper = None
        self.executor = None

    def _ensure_components(self):
        if not self.mapper:
            from src_local.utils.test_mapper import TestMapper
            from src_local.utils.parallel_test_executor import ParallelTestExecutor
            self.mapper = TestMapper()
            self.executor = ParallelTestExecutor()
    
    def run_unittest_discover(self, project_root: str) -> dict:
        """🧪 Discovery Sequencial."""
        import time
        start_test = time.time()
        try:
            result = subprocess.run(
                [sys.executable, "-m", "unittest", "discover", "tests"],
                capture_output=True, text=True, cwd=str(project_root),
                encoding='utf-8', errors='ignore'
            )
            duration = time.time() - start_test
            logger.info(f"⏱️ [TestRunner] Suíte sequencial executada em {duration:.2f}s")
            return self._parse_output(result.stderr, result.returncode == 0)
        except Exception as e:
            logger.error(f"🚨 Falha crítica: {e}")
            return {"success": False, "error": str(e), "total_run": 0, "failed": 1}

    def run_parallel_discovery(self, project_root: str) -> dict:
        """🚀 Execução Paralela Soberana via delegação."""
        import time
        self._ensure_components()
        start_time = time.time()
        
        root = Path(project_root)
        test_dir = root / "tests"
        if not test_dir.exists():
            return {"success": True, "total_run": 0, "failed": 0, "pass_rate": 100}

        test_files = [str(f) for f in test_dir.glob("test_*.py")]
        
        results = self.executor.run_parallel(project_root, test_files) # ParallelTestExecutor.run_parallel is instance method? Yes I implemented it as instance method.

        duration = time.time() - start_time
        logger.info(f"⏱️ [TestRunner] Suíte paralela concluída em {duration:.2f}s")
        return self._consolidate_results(results)

    def run_selective_tests(self, project_root: str, changed_files: list) -> dict:
        """🎯 Diagnóstico Cirúrgico: Executa apenas testes afetados por mudanças."""
        import time
        self._ensure_components()
        start_time = time.time()
        
        test_files = [str(f) for f in self.mapper.map_files_to_tests(project_root, changed_files)]
        
        if not test_files:
            logger.info("🛡️ [TestRunner] Nenhuma mudança detectada exige novos testes unitários.")
            return {"success": True, "total_run": 0, "failed": 0, "pass_rate": 100, "selective": True}

        logger.info(f"🎯 [TestRunner] Executando {len(test_files)} testes seletivos...")
        
        # Reusa lógica de execução (pode ser paralela ou sequencial dependendo do volume, aqui reusamos parallel executor para simplicidade se test_files > 1, mas idealmente batch único é melhor para poucos testes)
        # Vamos rodar sequencial simplificado se for pouco, mas para manter consistência com extracted logic, podemos usar o executor também ou manter _run_test_batch aqui se quisermos.
        # Mas o goal é reduzir complexidade. Vamos usar o executor paralelo mesmo para seletivos, ele lida bem.
        results = self.executor.run_parallel(project_root, test_files)

        duration = time.time() - start_time
        logger.info(f"⏱️ [TestRunner] Testes seletivos concluídos em {duration:.2f}s")
        consolidated = self._consolidate_results(results)
        consolidated["selective"] = True
        return consolidated

    def _consolidate_results(self, results: list) -> dict:
        total_run = sum(r.get("total_run", 0) for r in results)
        failed = sum(r.get("failed", 0) for r in results)
        success = failed == 0 and total_run > 0
        pass_rate = round(((total_run - failed) / total_run * 100), 2) if total_run > 0 else 0
        return {
            "success": success, "total_run": total_run, "failed": failed,
            "pass_rate": pass_rate, "results": results
        }

    def _parse_output(self, output: str, is_success: bool) -> dict:
        tests_run = 0
        failures = 0
        run_match = re.search(r"Ran (\d+) tests", output)
        if run_match: tests_run = int(run_match.group(1))
        
        fail_match = re.search(r"FAILED \((?:failures|errors|failures=\d+, errors=)(\d+)", output)
        if fail_match:
            failures = int(fail_match.group(1))
        elif not is_success and tests_run > 0:
            failures = 1 
        elif not is_success and tests_run == 0:
            failures = 1

        return {
            "success": is_success and failures == 0,
            "total_run": tests_run or (1 if not is_success else 0),
            "failed": failures,
            "raw_output": output 
        }
