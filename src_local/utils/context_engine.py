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
        """
        🔭 Varre o projeto delegando a inteligência para os assistentes técnicos.
        """
        from src_local.utils.file_system_scanner import FileSystemScanner
        scanner = FileSystemScanner(self.project_root, self.analyst)
        
        logger.info("🧠 Mapeando topologia...")
        self.project_identity = self._discover_identity()
        self.map = {}
        self.all_files_index = scanner.scan_all_filenames()

        for path in scanner.get_analyzable_files():
            self._register_file(path)
        
        self._build_dependency_map()
        logger.info(f"✅ DNA Processado: {len(self.map)} componentes.")
        return {"identity": self.project_identity, "map": self.map}

    def _register_file(self, path):
        try:
            rel_path = path.relative_to(self.project_root).as_posix()
            if rel_path not in self.map:
                self.map[rel_path] = self._analyze_file(path)
        except Exception:
            pass

    def _analyze_file(self, path: Path):
        """
        🧬 Decompõe um arquivo individual em metadados PhD.
        """
        try:
            content = path.read_text(encoding='utf-8', errors='ignore')
            info = self._get_initial_info(path)
            
            # Delegações técnicas estruturais
            if path.suffix == '.py':
                info.update(self.analyst.analyze_python(content, path.name))
            elif path.suffix in ['.kt', '.kts']:
                info.update(self.analyst.analyze_python(content, path.name)) # StructuralAnalyst handles both extensions
            
            # Normalização de nome para o auditor de cobertura
            file_name_clean = path.name.lower()
            
            # Delegações especializadas
            info.update(self.guardian.detect_vulnerabilities(content, info["component_type"]))
            info["has_test"] = self.coverage_auditor.detect_test(path, info["component_type"], self.all_files_index)
            
            # FBI MODE: Apenas arquivos na pasta /tests/ são considerados fontes de verdade de teste
            is_real_test_file = "/tests/" in str(path).replace("\\", "/") or "\\tests\\" in str(path)
            
            if info["component_type"] == "TEST" and is_real_test_file:
                self._analyze_test_quality(content, info)
            else:
                # FBI MODE: Se não é um arquivo físico de teste, não tem profundidade de teste
                info["test_depth"] = {"assertion_count": 0, "quality_level": "NONE"}
                # Se não é arquivo de teste, a cobertura depende do auditor
                if not is_real_test_file:
                    info["has_test"] = self.coverage_auditor.detect_test(path, info["component_type"], self.all_files_index)
                
            return info
        except Exception as e:
            logger.error(f"❌ Erro ao analisar metadados de {path}: {e}", exc_info=True)
            return {"error": str(e), "component_type": "UNKNOWN"}

    def _get_initial_info(self, path: Path):
        """
        📝 Gera o snapshot inicial de informações do componente.
        Define o domínio operacional e o tipo de componente baseado no caminho.
        """
        try:
            rel_path = path.relative_to(self.project_root).as_posix().lower()
        except ValueError:
            # Caso o caminho seja absoluto ou fora da raiz (comum em testes)
            rel_path = path.name.lower()
            
        comp_type = self.analyst.map_component_type(rel_path)
        is_gold = "compliance_standard.py" in rel_path or "standard" in rel_path
        
        # Rigor PhD: Todo arquivo é Ponto Cego até que se prove o contrário (has_test = False)
        return {
            "purpose": "Logic", "functions": [], "classes": [],
            "brittle": False, "silent_error": False, "has_test": False,
            "component_type": comp_type, 
            "domain": "EXPERIMENTATION" if comp_type == "TEST" else ("KNOWLEDGE_BASE" if is_gold else "PRODUCTION"), 
            "is_gold_standard": is_gold, "path": str(path)
        }

    def _analyze_test_quality(self, content, info):
        """
        🧪 Avalia a profundidade e eficácia dos testes unitários.
        Mapeia a densidade de asserções e classifica o nível de qualidade.
        """
        # Suporta Python (assert/self.assert) e Kotlin/Java (assert/check/assertEquals)
        assertions = len(re.findall(r"assert[A-Z]\w*\(|self\.assert|check\(|assertThat\(|expect\(", content))
        # Adição de contagem linear para assert simples
        assertions += content.count("assert ")
        
        info["test_depth"] = {
            "assertion_count": assertions,
            "quality_level": "DEEP" if assertions > 5 else "SHALLOW"
        }

    def _build_dependency_map(self):
        """
        🌐 Constrói o grafo de chamadas e dependências do projeto.
        Calcula o acoplamento e a instabilidade de cada nó do sistema.
        """
        for file, data in self.map.items():
            data["coupling"] = self.mapper.calculate_metrics(file, data, self.map)
            self.call_graph[file] = [f for f in self.map.keys() if f != file and any(c in str(data) for c in self.map[f].get('classes', []))]

    def analyze_stack_parity(self, personas):
        """
        ⚖️ Analisa a simetria de inteligência entre as stacks operacionais.
        Mapeia gaps de cobertura de Agentes PhD entre Python, Kotlin e Flutter.
        """
        parity = self.parity_analyst.analyze_stack_gaps(personas)
        parity["detected"] = self.project_identity.get("stacks", set())
        return parity

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
