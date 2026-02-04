import logging
import re
from pathlib import Path
from src_local.agents.Support.dna_profiler import DNAProfiler
from src_local.agents.Support.coverage_auditor import CoverageAuditor

logger = logging.getLogger(__name__)

class ContextEngine:
    """
    🧠 Cérebro Semântico PhD.
    O Orquestrador de metadados responsável por mapear a topologia do projeto, 
    identificar o DNA técnico e delegar a inteligência de análise para Agentes de Suporte.
    """
    
    def __init__(self, project_root, support_tools=None):
        """
        🏗️ Inicializa o motor de contexto.
        Injeta ferramentas de análise estrutural, proteção e mapeamento.
        """
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
        """
        🛡️ Injeção de Dependências via Assembler.
        Mobiliza a junta de suporte core para operações de baixo nível.
        """
        from src_local.agents.Support.infrastructure_assembler import InfrastructureAssembler
        support = InfrastructureAssembler.assemble_core_support()
        self.analyst = support["analyst"]
        self.guardian = support["guardian"]
        self.mapper = support["mapper"]
        self.parity_analyst = support["parity"]

    def analyze_project(self):
        """🔭 Varre o projeto delegando a inteligência para os assistentes técnicos."""
        from src_local.utils.topology_engine_phd import TopologyEnginePhd
        logger.info("🧠 Mapeando topologia do projeto...")
        self.project_identity = self._discover_identity()
        self.map = {}
        self.all_files_index = TopologyEnginePhd.discover_files(self.project_root)

        for s_dir in TopologyEnginePhd.get_search_dirs(self.project_root):
            for path in s_dir.rglob('*'):
                rel = TopologyEnginePhd.should_process(path, self.project_root, self.analyst, self.map)
                if rel: self.map[rel] = self._analyze_file(path)
        
        self._build_dependency_map()
        return {"identity": self.project_identity, "map": self.map}

    def analyze_stack_parity(self, personas):
        """⚖️ Analisa a simetria de inteligência entre as stacks operacionais."""
        parity = self.parity_analyst.analyze_stack_gaps(personas)
        parity["detected"] = self.project_identity.get("stacks", set())
        return parity

    def _analyze_file(self, path: Path):
        """🧬 Decompõe um arquivo individual em metadados PhD."""
        try:
            content = path.read_text(encoding='utf-8', errors='ignore')
            info = self._get_initial_info(path)
            self._apply_structural_analysis(path, content, info)
            info.update(self.guardian.detect_vulnerabilities(content, info["component_type"]))
            self._process_test_context(path, content, info)
            return info
        except Exception as e:
            logger.error(f"❌ Erro ao analisar {path}: {e}")
            return {"error": str(e), "component_type": "UNKNOWN"}

    def _apply_structural_analysis(self, path, content, info):
        if path.suffix == '.py':
            info.update(self.analyst.analyze_python(content, path.name))
        elif path.suffix in ['.kt', '.kts']:
            info.update(self.analyst.analyze_python(content, path.name))

    def _process_test_context(self, path, content, info):
        is_real_test = "/tests/" in str(path).replace("\\", "/") or "\\tests\\" in str(path)
        if info["component_type"] == "TEST" and is_real_test:
            self._analyze_test_quality(content, info)
        else:
            info["test_depth"] = {"assertion_count": 0, "quality_level": "NONE"}
            if not is_real_test:
                info["has_test"] = self.coverage_auditor.detect_test(path, info["component_type"], self.all_files_index)

    def _get_initial_info(self, path: Path):
        try:
            rel_path = path.relative_to(self.project_root).as_posix().lower()
        except ValueError:
            rel_path = path.name.lower()
        comp_type = self.analyst.map_component_type(rel_path)
        is_gold = "compliance_standard.py" in rel_path or "standard" in rel_path
        return {
            "purpose": "Logic", "functions": [], "classes": [],
            "brittle": False, "silent_error": False, "has_test": False,
            "component_type": comp_type, 
            "domain": "EXPERIMENTATION" if comp_type == "TEST" else ("KNOWLEDGE_BASE" if is_gold else "PRODUCTION"), 
            "is_gold_standard": is_gold, "path": str(path)
        }

    def _analyze_test_quality(self, content, info):
        assertions = len(re.findall(r"assert[A-Z]\w*\(|self\.assert|check\(|assertThat\(|expect\(", content))
        assertions += content.count("assert ")
        info["test_depth"] = {"assertion_count": assertions, "quality_level": "DEEP" if assertions > 5 else "SHALLOW"}

    def _build_dependency_map(self):
        for file, data in self.map.items():
            data["coupling"] = self.mapper.calculate_metrics(file, data, self.map)
            self.call_graph[file] = [f for f in self.map.keys() if f != file and any(c in str(data) for c in self.map[f].get('classes', []))]

    def _discover_identity(self):
        """
        🆔 Delega a descoberta de DNA estratégico para o DNAProfiler.
        Mapeia as linguagens presentes e a missão central do repositório.
        """
        try:
            return self.dna_profiler.discover_identity(self.project_root)
        except Exception as e:
            logger.error(f"🚨 Falha crítica ao descobrir identidade: {e}", exc_info=True)
            return {"stacks": set(), "core_mission": "Software Proposital"}

    def get_criticality_score(self, file_path):
        """
        ⚠️ Calcula o índice de criticidade sistêmica de um arquivo.
        Baseia-se no volume de dependentes e na localização estratégica (CORE/BASE).
        """
        score = 0
        file_name = Path(file_path).stem
        for deps in self.call_graph.values():
            if any(file_name in str(d) for d in deps): score += 1
        if "core" in str(file_path) or "base" in str(file_path): score += 10
        return score
