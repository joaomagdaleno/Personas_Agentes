import multiprocessing
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging

logger = logging.getLogger(__name__)

class TaskExecutor:
    """
    🚀 Executor de Tarefas PhD.
    O braço de processamento paralelo do Orquestrador, gerenciando concorrência
    via ThreadPool e otimizando a carga de trabalho baseada no hardware disponível.
    """
    
    def __init__(self):
        from src_local.utils.resource_governor import ResourceGovernor
        profile = ResourceGovernor.get_performance_profile()
        self.max_workers = profile["max_workers"]
        logger.info(f"🚀 TaskExecutor em modo {profile['profile']} ({self.max_workers} workers).")

    def run_parallel(self, task_func, items):
        """
        🧬 Executa uma função soberana em paralelo sobre uma lista de itens.
        Garante a consolidação atômica dos resultados e o isolamento de falhas.
        """
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
                    logger.error(f"🚨 Falha crítica na execução paralela: {e}", exc_info=True)
        return results
