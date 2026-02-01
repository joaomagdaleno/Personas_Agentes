import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class QualityAnalyst:
    """Assistente Técnico: Analista de Densidade de Verificação 📏"""
    
    def calculate_confidence_matrix(self, map_data: dict) -> list:
        """Correlaciona entropia de produção com cobertura de asserções via busca flexível."""
        matrix = []
        for file, info in map_data.items():
            if "src/" not in file or info.get("component_type") == "TEST":
                continue
            
            # Busca Flexível: Procura qualquer teste que contenha o nome do módulo
            target_name = Path(file).stem
            test_info = self._find_test_for_module(target_name, map_data)
            
            complexity = info.get("complexity", 1)
            assertions = 0
            if test_info:
                assertions = test_info.get("test_depth", {}).get("assertion_count", 0)
            
            ratio = (assertions * 5) / complexity if complexity > 0 else 1
            
            matrix.append({
                "file": file, "complexity": complexity, "assertions": assertions,
                "coverage_ratio": round(ratio, 2),
                "test_status": "DEEP" if ratio >= 1.0 and assertions > 0 else "SHALLOW"
            })
        return sorted(matrix, key=lambda x: x['complexity'], reverse=True)

    def _find_test_for_module(self, module_name, map_data):
        """Busca o metadado do teste correspondente ao módulo."""
        for file, info in map_data.items():
            if info.get("component_type") == "TEST":
                # Verifica se o nome do arquivo de teste contém o nome do módulo
                if module_name in file.lower():
                    return info
        return None
