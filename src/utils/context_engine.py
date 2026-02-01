import logging
import re
from pathlib import Path

logger = logging.getLogger(__name__)

class ContextEngine:
    """Cérebro Semântico PhD: Orquestrador de metadados via delegação total."""
    
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.map, self.call_graph, self.project_identity = {}, {}, {}
        
        # Injeção via Assembler (Core Support)
        from src.agents.Support.infrastructure_assembler import InfrastructureAssembler
        support = InfrastructureAssembler.assemble_core_support()
        
        self.analyst = support["analyst"]
        self.guardian = support["guardian"]
        self.mapper = support["mapper"]
        self.parity_analyst = support["parity"]

    def analyze_project(self):
        """Varre o projeto delegando a inteligência para os assistentes técnicos."""
        logger.info("🧠 Mapeando topologia do projeto (Soberania Isolada)...")
        self.project_identity = self._discover_identity()
        self.map = {}
        
        # OTIMIZAÇÃO: Varre o disco apenas UMA vez para criar o índice de arquivos
        self.all_files_index = [p.name.lower() for p in self.project_root.rglob('*') if p.is_file()]
        
        for path in self.project_root.rglob('*'):
            if self.analyst.should_ignore(path): continue
            if self.analyst.is_analyable(path):
                # Modernização: as_posix() substitui replace(os.sep, "/")
                rel_path = path.relative_to(self.project_root).as_posix()
                self.map[rel_path] = self._analyze_file(path)
        
        self._build_dependency_map()
        logger.info(f"✅ DNA Processado: {len(self.map)} componentes identificados.")
        return {"identity": self.project_identity, "map": self.map}

    def _analyze_file(self, path: Path):
        try:
            content = path.read_text(encoding='utf-8', errors='ignore')
            info = self._get_initial_info(path)
            
            # Agregação de inteligência via delegação
            info.update(self.guardian.detect_vulnerabilities(content, info["component_type"]))
            self._detect_test_coverage(path, info)
            
            if path.suffix == '.py':
                info.update(self.analyst.analyze_python(content, path.name))
            
            if info["component_type"] == "TEST":
                self._analyze_test_quality(content, info)
                
            return info
        except Exception as e:
            logger.error(f"❌ Erro ao analisar metadados de {path}: {e}", exc_info=True)
            return {"error": str(e), "component_type": "UNKNOWN"}

    def _get_initial_info(self, path: Path):
        rel_path = path.relative_to(self.project_root).as_posix().lower()
        comp_type = self.analyst.map_component_type(rel_path)
        is_gold = "compliance_standard.py" in rel_path or "standard" in rel_path
        return {
            "purpose": "Logic", "functions": [], "classes": [],
            "brittle": False, "silent_error": False, "has_test": True,
            "component_type": comp_type, 
            "domain": "EXPERIMENTATION" if comp_type == "TEST" else ("KNOWLEDGE_BASE" if is_gold else "PRODUCTION"), 
            "is_gold_standard": is_gold, "path": str(path)
        }

    def _analyze_test_quality(self, content, info):
        """Métricas simplificadas de qualidade de teste (Universal)."""
        # Suporta Python (assert/self.assert) e Kotlin/Java (assert/check/assertEquals)
        assertions = len(re.findall(r"assert[A-Z]\w*\(|self\.assert|check\(|assertThat\(|expect\(", content))
        # Adição de contagem linear para assert simples
        assertions += content.count("assert ")
        
        info["test_depth"] = {
            "assertion_count": assertions,
            "quality_level": "DEEP" if assertions > 5 else "SHALLOW"
        }

    def _detect_test_coverage(self, path, info):
        if ("src" in str(path) or "app" in str(path)) and info["component_type"] != "TEST":
            stem = path.stem.lower()
            # Busca Instantânea no índice em memória
            # Reconhece: test_main.py, MainTest.kt, test_main_deep.py, etc.
            has_test = any(
                (f"test_{stem}" in f) or 
                (f"{stem}test" in f) 
                for f in self.all_files_index
            )
            info["has_test"] = has_test

    def _build_dependency_map(self):
        for file, data in self.map.items():
            data["coupling"] = self.mapper.calculate_metrics(file, data, self.map)
            self.call_graph[file] = [f for f in self.map.keys() if f != file and any(c in str(data) for c in self.map[f].get('classes', []))]

    def analyze_stack_parity(self, personas):
        parity = self.parity_analyst.analyze_stack_gaps(personas)
        parity["detected"] = self.project_identity.get("stacks", set())
        return parity

    def _discover_identity(self):
        dna = {"stacks": set(), "type": "Orquestrador Multi-Agente", "core_mission": "Orquestração de Inteligência Artificial"}
        if (self.project_root / 'pubspec.yaml').exists(): dna["stacks"].add("Flutter")
        if (self.project_root / 'build.gradle').exists() or (self.project_root / 'build.gradle.kts').exists(): 
            dna["stacks"].add("Kotlin")
        if (self.project_root / 'requirements.txt').exists(): dna["stacks"].add("Python")
        return dna

    def get_criticality_score(self, file_path):
        score = 0
        file_name = Path(file_path).stem
        for deps in self.call_graph.values():
            if any(file_name in str(d) for d in deps): score += 1
        if "core" in str(file_path) or "base" in str(file_path): score += 10
        return score

        def analyze_stack_parity(self, personas):

            parity = self.parity_analyst.analyze_stack_gaps(personas)

            parity["detected"] = self.project_identity.get("stacks", set())

            return parity

    