import logging
import re
from pathlib import Path
from src.agents.Support.dna_profiler import DNAProfiler
from src.agents.Support.coverage_auditor import CoverageAuditor

logger = logging.getLogger(__name__)

class ContextEngine:
    """Cérebro Semântico PhD: Orquestrador de metadados via delegação total."""
    
    def __init__(self, project_root, support_tools=None):
        self.project_root = Path(project_root)
        self.map, self.call_graph, self.project_identity = {}, {}, {}
        self.dna_profiler = DNAProfiler()
        self.coverage_auditor = CoverageAuditor()
        self.all_files_index = [] # Inicialização segura
        
        if support_tools:
            self.analyst = support_tools["analyst"]
            self.guardian = support_tools["guardian"]
            self.mapper = support_tools["mapper"]
            self.parity_analyst = support_tools["parity"]
        else:
            self._initialize_support_tools()

    def _initialize_support_tools(self):
        """Injeção via Assembler (Core Support)."""
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
        
        # OTIMIZAÇÃO: Varre o disco apenas UMA vez
        self.all_files_index = [p.name.lower() for p in self.project_root.rglob('*') if p.is_file()]
        
        for path in self.project_root.rglob('*'):
            if self.analyst.should_ignore(path) or not self.analyst.is_analyable(path):
                continue
            rel_path = path.relative_to(self.project_root).as_posix()
            self.map[rel_path] = self._analyze_file(path)
        
        self._build_dependency_map()
        logger.info(f"✅ DNA Processado: {len(self.map)} componentes identificados.")
        return {"identity": self.project_identity, "map": self.map}

    def _analyze_file(self, path: Path):
        try:
            content = path.read_text(encoding='utf-8', errors='ignore')
            info = self._get_initial_info(path)
            
            # Delegações especializadas
            info.update(self.guardian.detect_vulnerabilities(content, info["component_type"]))
            info["has_test"] = self.coverage_auditor.detect_test(path, info["component_type"], self.all_files_index)
            
            if path.suffix == '.py':
                info.update(self.analyst.analyze_python(content, path.name))
            
            if info["component_type"] == "TEST":
                self._analyze_test_quality(content, info)
                
            return info
        except Exception as e:
            logger.error(f"❌ Erro ao analisar metadados de {path}: {e}", exc_info=True)
            return {"error": str(e), "component_type": "UNKNOWN"}

    def _get_initial_info(self, path: Path):
        try:
            rel_path = path.relative_to(self.project_root).as_posix().lower()
        except ValueError:
            # Caso o caminho seja absoluto ou fora da raiz (comum em testes)
            rel_path = path.name.lower()
            
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

    def _build_dependency_map(self):
        for file, data in self.map.items():
            data["coupling"] = self.mapper.calculate_metrics(file, data, self.map)
            self.call_graph[file] = [f for f in self.map.keys() if f != file and any(c in str(data) for c in self.map[f].get('classes', []))]

    def analyze_stack_parity(self, personas):
        parity = self.parity_analyst.analyze_stack_gaps(personas)
        parity["detected"] = self.project_identity.get("stacks", set())
        return parity

    def _discover_identity(self):
        """Delega a descoberta de DNA para o DNAProfiler."""
        return self.dna_profiler.discover_identity(self.project_root)

    def get_criticality_score(self, file_path):
        score = 0
        file_name = Path(file_path).stem
        for deps in self.call_graph.values():
            if any(file_name in str(d) for d in deps): score += 1
        if "core" in str(file_path) or "base" in str(file_path): score += 10
        return score