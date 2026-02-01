import os

class PyramidAnalyst:
    """Assistente Técnico: Auditor de Distribuição de Testes (Pirâmide) 📐"""
    
    def analyze(self, map_data: dict, read_func) -> dict:
        """Classifica os testes entre Unit, Integration e E2E."""
        pyramid = {"unit": 0, "integration": 0, "e2e": 0, "total": 0}
        
        for file in map_data.keys():
            if "tests/" not in file.replace(os.sep, "/"): continue
            
            content = read_func(file)
            if not content: continue
            
            pyramid["total"] += 1
            if "mock" in content or "patch" in content: pyramid["integration"] += 1
            elif "selenium" in content or "integration_test" in content: pyramid["e2e"] += 1
            else: pyramid["unit"] += 1
        
        return pyramid
