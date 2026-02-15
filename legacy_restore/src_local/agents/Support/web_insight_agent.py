import logging
import requests
from src_local.utils.logging_config import log_performance
import time

logger = logging.getLogger(__name__)

class WebInsightAgent:
    """Agente especialista em buscar documentação externa para enriquecer o contexto."""
    
    def fetch_library_context(self, lib_name):
        """Busca o resumo de uma biblioteca no repositório PyPI ou documentação oficial."""
        import time
        from src_local.utils.logging_config import log_performance
        start_t = time.time()
        
        logger.info(f"🌍 [WebInsight] Buscando inteligência externa para: {lib_name}")
        
        try:
            url = f"https://pypi.org/pypi/{lib_name}/json"
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                summary = data['info'].get('summary', 'Sem resumo disponível.')
                log_performance(logger, start_t, f"🌍 [WebInsight] Data fetch for {lib_name}")
                return f"DOC EXTERNA ({lib_name}): {summary}"
        except Exception:
            pass
        return None
