"""
⚖️ Governador de Recursos Soberano.
Garante que a IA seja uma cidadã bem-educada no sistema operacional.
"""
import psutil
import logging
import os
import time

logger = logging.getLogger(__name__)

class ResourceGovernor:
    def __init__(self, cpu_limit=85, mem_limit=95):
        self.cpu_limit = cpu_limit
        self.mem_limit = mem_limit
        self.process = psutil.Process(os.getpid())
        self._set_low_priority()

    def _set_low_priority(self):
        """Define a prioridade do processo como 'IDLE' (Mínima) para não travar o PC."""
        try:
            if os.name == 'nt':
                # IDLE_PRIORITY_CLASS = 0x00000040. Windows dá preferência a tudo sobre isso.
                self.process.nice(psutil.IDLE_PRIORITY_CLASS)
            else:
                self.process.nice(15)
            logger.info("⚖️ [Governor] Prioridade de processo ajustada para 'IDLE' (Invisível).")
        except Exception as e:
            logger.warning(f"⚠️ Falha ao ajustar prioridade: {e}")

    def should_throttle(self):
        """Verifica se o sistema está sob carga pesada externa."""
        cpu_usage = psutil.cpu_percent(interval=0.1)
        mem_usage = psutil.virtual_memory().percent
        
        if cpu_usage > self.cpu_limit or mem_usage > self.mem_limit:
            logger.warning(f"🌡️ [Governor] Carga alta detectada (CPU: {cpu_usage}%, MEM: {mem_usage}%). Reduzindo IA.")
            return True
        return False

    def wait_if_needed(self):
        """Pausa a execução se o sistema estiver sobrecarregado."""
        while self.should_throttle():
            time.sleep(5) # Aguarda 5 segundos antes de re-checar

    @staticmethod
    def get_performance_profile():
        """
        📊 Define o perfil de performance baseado no hardware real.
        Lite: < 8GB RAM ou < 4 Cores
        Standard: 8GB-16GB RAM
        Soberano: > 16GB RAM e 8+ Cores
        """
        import multiprocessing
        cores = multiprocessing.cpu_count()
        ram_gb = psutil.virtual_memory().total / (1024**3)
        
        if ram_gb > 16 and cores >= 8:
            return {
                "profile": "Soberano",
                "max_workers": cores * 2,
                "ai_ctx": 4096,
                "ai_threads": max(4, cores // 2)
            }
        elif ram_gb >= 8:
            return {
                "profile": "Standard",
                "max_workers": cores,
                "ai_ctx": 2048,
                "ai_threads": max(2, cores // 4)
            }
        else:
            return {
                "profile": "Lite",
                "max_workers": max(2, cores // 2),
                "ai_ctx": 1024,
                "ai_threads": 2
            }

    @staticmethod
    def get_current_pressure():
        """🌐 Retorna métricas de pressão do sistema em tempo real."""
        cpu = psutil.cpu_percent(interval=0.1)
        ram = psutil.virtual_memory().percent
        return {
            "cpu_percent": cpu,
            "ram_percent": ram,
            "is_critical": cpu > 90 or ram > 90
        }
