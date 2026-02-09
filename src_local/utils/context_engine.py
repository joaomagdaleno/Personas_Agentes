import logging
import re
from pathlib import Path
from src_local.agents.Support.dna_profiler import DNAProfiler
from src_local.agents.Support.coverage_auditor import CoverageAuditor

logger = logging.getLogger(__name__)

class ContextEngine:
    """
    🧠 Cérebro Semântico PhD.
    O Orquestrador de metadados responsável por mapear a topologia do projeto.
    """
    
    def __init__(self, project_root, support_tools=None):
        self.project_root = Path(project_root)
        self.map, self.call_graph, self.project_identity = {}, {}, {}
        self.dna_profiler = DNAProfiler()
        self.coverage_auditor = CoverageAuditor()
        self.all_files_index = []
        
        if support_tools:
            self._inject_support(support_tools)
        else:
            self._initialize_support_tools()

    def _inject_support(self, tools):
        self.analyst, self.guardian = tools["analyst"], tools["guardian"]
        self.mapper, self.parity_analyst = tools["mapper"], tools["parity"]

    def _initialize_support_tools(self):
        from src_local.agents.Support.infrastructure_assembler import InfrastructureAssembler
        support = InfrastructureAssembler.assemble_core_support()
        self._inject_support(support)

    def analyze_project(self):
        """🔭 Varre o projeto delegando a inteligência para os assistentes técnicos."""
        from src_local.utils.file_system_scanner import FileSystemScanner
        scanner = FileSystemScanner(self.project_root, self.analyst)
        
        logger.info("🧠 Mapeando topologia...")
        self.project_identity = self._discover_identity()
        self.map, self.all_files_index = {}, scanner.scan_all_filenames()

        # Processamento em Lote
        analyzable = scanner.get_analyzable_files()
        self._content_cache = self._pre_read_files(analyzable)
        self._register_batch_files()
        
        # Finalização
        self._content_cache = {}
        self._build_dependency_map()
        logger.info(f"✅ DNA Processado: {len(self.map)} componentes.")
        return {"identity": self.project_identity, "map": self.map}

    def _register_batch_files(self):
        """Itera sobre o cache de conteúdo para registrar cada arquivo."""
        for path_str in self._content_cache.keys():
            self._register_file(Path(self.project_root / path_str))

    def _pre_read_files(self, files_iterator):
        cache = {}
        for path in files_iterator:
            try:
                rel = path.relative_to(self.project_root).as_posix()
                cache[rel] = path.read_text(encoding='utf-8', errors='ignore')
            except: continue
        return cache

    def _register_file(self, path, ignore_test_context=False):
        try:
            rel_path = path.relative_to(self.project_root).as_posix()
            if rel_path in self.map: return
            
            content = self._get_cached_content(path, rel_path)
            info = self._get_initial_info(path, rel_path)
            info["content"] = content
            
            self._perform_deep_analysis(path, content, info, ignore_test_context)
            self.map[rel_path] = info
        except Exception as e:
            logger.error(f"❌ Erro ao analisar {path}: {e}")

    def _get_cached_content(self, path, rel_path):
        if not hasattr(self, '_content_cache'): self._content_cache = {}
        content = self._content_cache.get(rel_path)
        return content if content is not None else path.read_text(encoding='utf-8', errors='ignore')

    def _perform_deep_analysis(self, path, content, info, ignore_test):
        if path.suffix == '.py':
            info.update(self.analyst.analyze_python(content, path.name))
        
        # Auditorias de vulnerabilidade e teste
        info.update(self.guardian.detect_vulnerabilities(content, info["component_type"], ignore_test))
        info["has_test"] = self.coverage_auditor.detect_test(path, info["component_type"], self.all_files_index)
        
        if info["component_type"] == "TEST":
            self._analyze_test_quality(content, info)

    def _get_initial_info(self, path: Path, rel_path):
        comp_type = self.analyst.map_component_type(rel_path)
        return {
            "purpose": "Logic", "functions": [], "classes": [],
            "brittle": False, "silent_error": False, "has_test": False,
            "component_type": comp_type, 
            "domain": "EXPERIMENTATION" if comp_type == "TEST" else "PRODUCTION", 
            "path": str(path), "rel_path": rel_path
        }

    def _analyze_test_quality(self, content, info):
        # Mapeia densidade de asserções
        assertions = len(re.findall(r"assert[A-Z]\w*\(|self\.assert|check\(|assertThat\(|expect\(", content))
        assertions += content.count("assert ")
        info["test_depth"] = {"assertion_count": assertions, "quality_level": "DEEP" if assertions > 5 else "SHALLOW"}

    def _build_dependency_map(self):
        for file, data in self.map.items():
            data["coupling"] = self.mapper.calculate_metrics(file, data, self.map)
            self.call_graph[file] = self._find_dependents(file, data)

    def _find_dependents(self, file, data):
        """Localiza componentes que dependem do arquivo atual."""
        return [f for f in self.map.keys() if f != file and any(c in str(data) for c in self.map[f].get('classes', []))]

    def analyze_stack_parity(self, personas):
        parity = self.parity_analyst.analyze_stack_gaps(personas)
        parity["detected"] = self.project_identity.get("stacks", set())
        return parity

    def _discover_identity(self):
        try: return self.dna_profiler.discover_identity(self.project_root)
        except Exception as e:
            logger.error(f"🚨 Falha ao descobrir identidade: {e}")
            return {"stacks": set(), "core_mission": "Software Proposital"}

    def get_criticality_score(self, file_path):
        score = 0
        stem = Path(file_path).stem
        for deps in self.call_graph.values():
            if any(stem in str(d) for d in deps): score += 1
        if any(kw in str(file_path) for kw in ["core", "base"]): score += 10
        return score