import logging
import re
from pathlib import Path

logger = logging.getLogger(__name__)

class AnalysisEnginePhd:
    """🧬 Motor de Análise PhD: Decomposição Forense de Componentes."""
    
    @staticmethod
    def analyze(path, project_root, analyst, guardian, coverage, all_files):
        try:
            content = Path(path).read_text(encoding='utf-8', errors='ignore')
            info = AnalysisEnginePhd._get_init(path, project_root, analyst)
            
            # Estrutural
            if path.suffix == '.py': info.update(analyst.analyze_python(content, path.name))
            elif path.suffix in ['.kt', '.kts']: info.update(analyst.analyze_python(content, path.name))
            
            # Vulnerabilidades
            info.update(guardian.detect_vulnerabilities(content, info["component_type"]))
            
            # Testes
            is_real_test = "/tests/" in str(path).replace("\\", "/") or "\\tests\\" in str(path)
            if info["component_type"] == "TEST" and is_real_test:
                AnalysisEnginePhd._test_quality(content, info)
            else:
                info["test_depth"] = {"assertion_count": 0, "quality_level": "NONE"}
                if not is_real_test:
                    info["has_test"] = coverage.detect_test(path, info["component_type"], all_files, info)
            return info
        except Exception as e:
            logger.error(f"❌ Erro AnalysisEngine: {e}")
            return {"error": str(e), "component_type": "UNKNOWN"}

    @staticmethod
    def _get_init(path, project_root, analyst):
        try: rel = path.relative_to(project_root).as_posix().lower()
        except: rel = path.name.lower()
        comp_type = analyst.map_component_type(rel)
        is_gold = "compliance_standard.py" in rel or "standard" in rel
        return {
            "purpose": "Logic", "functions": [], "classes": [],
            "brittle": False, "silent_error": False, "has_test": False,
            "component_type": comp_type, 
            "domain": "EXPERIMENTATION" if comp_type == "TEST" else ("KNOWLEDGE_BASE" if is_gold else "PRODUCTION"), 
            "is_gold_standard": is_gold, "path": str(path)
        }

    @staticmethod
    def _test_quality(content, info):
        assertions = len(re.findall(r"assert[A-Z]\w*\(|self\.assert|check\(|assertThat\(|expect\(", content))
        assertions += content.count("assert ")
        info["test_depth"] = {"assertion_count": assertions, "quality_level": "DEEP" if assertions > 5 else "SHALLOW"}
