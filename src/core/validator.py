import subprocess
import sys
import re
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class SystemValidator:
    """Core: Protocolo de Auto-Verificação Vital 🛡️"""
    
    def verify_core_health(self, project_root: str) -> dict:
        """Executa a bateria de testes internos de integridade."""
        logger.info("🛡️ [Core] Iniciando Protocolo de Auto-Exame Vital...")
        root = Path(project_root)
        try:
            result = subprocess.run(
                [sys.executable, "-m", "unittest", "discover", "tests"],
                capture_output=True, text=True, cwd=str(root),
                encoding='utf-8', errors='ignore'
            )
            if result.returncode != 0:
                logger.warning(f"⚠️ Alguns testes de integridade falharam:\n{result.stderr}")
            
            return self._parse_results(result.stderr, result.returncode == 0)
        except Exception as e:
            logger.error(f"🚨 Falha crítica na execução do protocolo de auto-exame: {e}", exc_info=True)
            return {"success": False, "pass_rate": 0, "total_run": 0, "failed": 1}

    def _parse_results(self, output: str, is_success: bool) -> dict:
        tests_run = 0
        failures = 0
        # Captura estatísticas do unittest
        run_match = re.search(r"Ran (\d+) tests", output)
        if run_match: tests_run = int(run_match.group(1))
        
        # Detecta falhas ou erros
        fail_match = re.search(r"FAILED \((?:failures|errors|failures=\d+, errors=)(\d+)", output)
        if fail_match: 
            failures = int(fail_match.group(1))
        elif not is_success: 
            # Caso o returncode seja erro mas não achamos o padrão FAILED
            failures = 1 if tests_run == 0 else tests_run 

        pass_rate = 0
        if tests_run > 0:
            pass_rate = round(((tests_run - failures) / tests_run * 100), 2)

        return {
            "success": is_success and failures == 0,
            "total_run": tests_run,
            "failed": failures,
            "pass_rate": pass_rate
        }
