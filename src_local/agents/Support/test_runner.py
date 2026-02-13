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
        """🚀 Execução Paralela Soberana."""
        import time
        start_time = time.time()
        root = Path(project_root)
        test_dir = root / "tests"
        
        if not test_dir.exists():
            return {"success": True, "total_run": 0, "failed": 0, "pass_rate": 100}

        test_files = list(test_dir.glob("test_*.py"))
        logger.info(f"🏎️ [TestRunner] Acelerando {len(test_files)} testes em paralelo...")

        results = []
        with ProcessPoolExecutor() as executor:
            futures = {executor.submit(self._run_single_test, str(f), project_root): f for f in test_files}
            for future in as_completed(futures):
                results.append(future.result())

        duration = time.time() - start_time
        logger.info(f"⏱️ [TestRunner] Suíte paralela concluída em {duration:.2f}s")
        return self._consolidate_results(results)

    def _run_single_test(self, test_file: str, project_root: str):
        res = subprocess.run(
            [sys.executable, "-m", "unittest", test_file],
            capture_output=True, text=True, cwd=str(project_root),
            encoding='utf-8', errors='ignore'
        )
        return self._parse_output(res.stderr, res.returncode == 0)

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
