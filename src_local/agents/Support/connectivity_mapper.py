import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class ConnectivityMapper:
    """
    🌐 Mapeador de Conectividade PhD.
    Analista de topologia sistêmica que quantifica o acoplamento e a instabilidade
    entre componentes, identificando o "Mapa de Entropia" do projeto.
    """
    
    def calculate_metrics(self, file_path: str, data: dict, all_map: dict) -> dict:
        """
        📐 Calcula métricas de acoplamento aferente (entrada) e eferente (saída).
        Retorna o índice de instabilidade (0 a 1) para o componente.
        """
        import time
        start_map = time.time()
        eferent = len(data.get("dependencies", []))
        afferent = 0
        file_stem = Path(file_path).stem
        
        for other_file, other_data in all_map.items():
            if other_file == file_path: continue
            if any(file_stem in str(imp) for imp in other_data.get("dependencies", [])):
                afferent += 1
        
        instability = eferent / (afferent + eferent) if (afferent + eferent) > 0 else 0
        
        duration = time.time() - start_map
        if duration > 0.1:
            logger.debug(f"⏱️ [Connectivity] Mapeamento lento em {file_path}: {duration:.4f}s")
            
        return {
            "in": afferent,
            "out": eferent,
            "instability": instability
        }
