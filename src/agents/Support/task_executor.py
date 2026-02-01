import os
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging

logger = logging.getLogger(__name__)

class TaskExecutor:
    """Assistente Técnico: Mestre em Execução Paralela e Concorrência 🚀"""
    
    def __init__(self):
        self.max_workers = os.cpu_count() or 4

    def run_parallel(self, task_func, items):
        """Executa uma função em paralelo sobre uma lista de itens."""
        results = []
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = [executor.submit(task_func, item) for item in items]
            for future in as_completed(futures):
                try:
                    res = future.result()
                    if res:
                        if isinstance(res, list): results.extend(res)
                        else: results.append(res)
                except Exception as e:
                    logger.error(f"Falha na execução paralela: {e}")
        return results
