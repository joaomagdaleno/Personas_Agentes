import subprocess
import sys
import re
import logging

logger = logging.getLogger(__name__)

class TestRunner:
    """
    🏎️ Executor de Testes PhD.
    O braço mecânico que valida a integridade funcional do sistema, extraindo
    métricas de pass_rate e analisando tracebacks para descoberta de regressões.
    """
    
    def run_unittest_discover(self, project_root: str) -> dict:
        """
        🧪 Executa a bateria de testes unitários via Discovery.
        Retorna um snapshot estruturado da saúde funcional do componente.
        """
        import time
        start_test = time.time()
        try:
            result = subprocess.run(
                [sys.executable, "-m", "unittest", "discover", "tests"],
                capture_output=True, text=True, cwd=str(project_root),
                encoding='utf-8', errors='ignore'
            )
            
            duration = time.time() - start_test
            logger.info(f"⏱️ [TestRunner] Suíte executada em {duration:.2f}s")
            
            if result.returncode != 0:
                logger.debug(f"ℹ️ Resultado bruto dos testes:\n{result.stderr}")
            
            return self._parse_output(result.stderr, result.returncode == 0)
        except Exception as e:
            logger.error(f"🚨 Falha crítica na execução mecânica de testes: {e}", exc_info=True)
            return {"success": False, "error": str(e), "total_run": 0, "failed": 1}

    def _parse_output(self, output: str, is_success: bool) -> dict:
        """
        🧠 Transforma o texto bruto do terminal em dados estruturados PhD.
        Identifica falhas, erros e taxa de sucesso com precisão forense.
        """
        tests_run = 0
        failures = 0
        
        run_match = re.search(r"Ran (\d+) tests", output)
        if run_match: tests_run = int(run_match.group(1))
        
        fail_match = re.search(r"FAILED \((?:failures|errors|failures=\d+, errors=)(\d+)", output)
        if fail_match:
            failures = int(fail_match.group(1))
        elif not is_success:
            failures = 1 

        return {
            "success": is_success,
            "total_run": tests_run or (len(re.findall(r"\. ", output)) or 1),
            "failed": failures,
            "pass_rate": round(((tests_run - failures) / tests_run * 100), 2) if tests_run > 0 else 0,
            "raw_output": output # Preservado para análise estratégica posterior
        }
