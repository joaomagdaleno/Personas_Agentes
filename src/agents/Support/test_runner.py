import subprocess
import sys
import re
import logging

logger = logging.getLogger(__name__)

class TestRunner:
    """Assistente Técnico: Executor de Testes e Analista de Tracebacks 🏎️"""
    
    def run_unittest_discover(self, project_root: str) -> dict:
        """Executa a bateria de testes e extrai métricas puras."""
        try:
            result = subprocess.run(
                [sys.executable, "-m", "unittest", "discover", "tests"],
                capture_output=True, text=True, cwd=project_root
            )
            return self._parse_output(result.stderr, result.returncode == 0)
        except Exception as e:
            logger.error(f"Falha na execução mecânica de testes: {e}")
            return {"success": False, "error": str(e)}

    def _parse_output(self, output: str, is_success: bool) -> dict:
        """Transforma o texto bruto do terminal em dados estruturados."""
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
