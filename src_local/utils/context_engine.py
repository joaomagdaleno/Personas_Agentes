import logging
from pathlib import Path
from src_local.agents.Support.dna_profiler import DNAProfiler
from src_local.agents.Support.coverage_auditor import CoverageAuditor

logger = logging.getLogger(__name__)

class ContextEngine:
    def __init__(self, project_root, support_tools=None):
        self.project_root = Path(project_root)
        self.map, self.call_graph, self.project_identity = {}, {}, {}
        self.dna_profiler = DNAProfiler()
        self.coverage_auditor = CoverageAuditor()
        
        if support_tools:
            self.analyst, self.guardian, self.mapper, self.parity_analyst = support_tools["analyst"], support_tools["guardian"], support_tools["mapper"], support_tools["parity"]
        else:
            from src_local.agents.Support.infrastructure_assembler import InfrastructureAssembler
            s = InfrastructureAssembler.assemble_core_support()
            self.analyst, self.guardian, self.mapper, self.parity_analyst = s["analyst"], s["guardian"], s["mapper"], s["parity"]

    def analyze_project(self):
        from src_local.utils.topology_engine_phd import TopologyEnginePhd
        from src_local.utils.analysis_engine_phd import AnalysisEnginePhd
        self.project_identity = self.dna_profiler.discover_identity(self.project_root)
        self.map = {}
        files = TopologyEnginePhd.discover_files(self.project_root)

        for s_dir in TopologyEnginePhd.get_search_dirs(self.project_root):
            for path in s_dir.rglob('*'):
                rel = TopologyEnginePhd.should_process(path, self.project_root, self.analyst, self.map)
                if rel: self.map[rel] = AnalysisEnginePhd.analyze(path, self.project_root, self.analyst, self.guardian, self.coverage_auditor, files)
        
        for file, data in self.map.items():
            data["coupling"] = self.mapper.calculate_metrics(file, data, self.map)
            self.call_graph[file] = [f for f in self.map.keys() if f != file and any(c in str(data) for c in self.map[f].get('classes', []))]
        return {"identity": self.project_identity, "map": self.map}

    def analyze_stack_parity(self, personas):
        parity = self.parity_analyst.analyze_stack_gaps(personas)
        parity["detected"] = self.project_identity.get("stacks", set())
        return parity

    def get_criticality_score(self, file_path):
        score = 0
        name = Path(file_path).stem
        for deps in self.call_graph.values():
            if any(name in str(d) for d in deps): score += 1
        if "core" in str(file_path) or "base" in str(file_path): score += 10
        return score
