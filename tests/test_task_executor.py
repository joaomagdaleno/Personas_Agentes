import unittest
import logging
from src_local.agents.Support.task_executor import *

# Configuração de telemetria de teste
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestTaskExecutor")

class TestTaskexecutor(unittest.TestCase):
    def test_run_parallel_mixed_results(self):
        """Valida a execução paralela com retorno de listas e escalares."""
        logger.info("⚡ Testando execução paralela (ThreadPool)...")
        executor = TaskExecutor()
        
        def task_fn(item):
            if item == "list": return [1, 2]
            if item == "scalar": return 3
            return None
            
        results = executor.run_parallel(task_fn, ["list", "scalar", "none"])
        self.assertIn(1, results)
        self.assertIn(2, results)
        self.assertIn(3, results)
        self.assertEqual(len(results), 3)
        logger.info("✅ Execução paralela validada.")

    def test_run_parallel_error_isolation(self):
        """Valida o isolamento de falhas durante a execução paralela."""
        logger.info("⚡ Testando isolamento de falhas no executor...")
        executor = TaskExecutor()
        
        def failing_fn(item):
            if item == "fail": raise ValueError("Erro simulado")
            return item
            
        results = executor.run_parallel(failing_fn, ["fail", "success"])
        self.assertIn("success", results)
        self.assertEqual(len(results), 1)
        logger.info("✅ Isolamento de falhas validado.")

if __name__ == "__main__":
    unittest.main()
