import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class ConnectivityMapper:
    """Assistente Técnico: Especialista em Topologia e Acoplamento 🌐"""
    
    def calculate_metrics(self, file_path: str, data: dict, all_map: dict) -> dict:
        """Calcula instabilidade e acoplamento aferente/eferente."""
        eferent = len(data.get("dependencies", []))
        afferent = 0
        file_stem = Path(file_path).stem
        
        for other_file, other_data in all_map.items():
            if other_file == file_path: continue
            if any(file_stem in str(imp) for imp in other_data.get("dependencies", [])):
                afferent += 1
        
        instability = eferent / (afferent + eferent) if (afferent + eferent) > 0 else 0
        
        return {
            "in": afferent,
            "out": eferent,
            "instability": instability
        }
