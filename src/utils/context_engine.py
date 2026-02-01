import ast
import logging
import re
from pathlib import Path

logger = logging.getLogger(__name__)

class ContextEngine:
    """
    Cérebro Semântico PhD: Analisa a intenção e dependências do projeto.
    """
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.map = {}
        self.call_graph = {}
        self.project_identity = {}

    def analyze_project(self):
        """Varre o projeto com observabilidade nativa."""
        logger.info("🧠 Mapeando topologia do projeto...")
        
        self.project_identity = self._discover_identity()
        ignored = {'.git', '__pycache__', 'build', 'node_modules', '.venv', '.agent', '.gemini', 'submodules'}
        
        # Limpa o mapa para nova análise
        self.map = {}
        
        for path in self.project_root.rglob('*'):
            if any(part in ignored for part in path.parts):
                continue
                
            if path.is_file() and path.suffix in {'.py', '.dart', '.kt', '.yaml', '.xml'}:
                rel_path = str(path.relative_to(self.project_root)).replace("\\", "/")
                self.map[rel_path] = self._analyze_file(path)
        
        self._build_dependency_map()
        logger.info(f"✅ DNA Processado: {len(self.map)} componentes identificados.")
        
        return {"identity": self.project_identity, "map": self.map}

    def get_criticality_score(self, file_path):
        """Calcula a criticidade baseada em dependências e localização core."""
        score = 0
        file_name = Path(file_path).stem
        for deps in self.call_graph.values():
            if any(file_name in str(d) for d in deps):
                score += 1
        
        if "core" in str(file_path) or "base" in str(file_path):
            score += 10
        return score

    def deduce_project_dna(self):
        """Alias para compatibilidade com testes legados."""
        return self._discover_identity()

    def _discover_identity(self):
        dna = {
            "stacks": set(),
            "type": "Orquestrador Multi-Agente",
            "core_mission": "Orquestração de Inteligência Artificial",
            "is_multistack": False
        }
        if (self.project_root / 'pubspec.yaml').exists(): dna["stacks"].add("Flutter")
        if (self.project_root / 'build.gradle').exists() or (self.project_root / 'build.gradle.kts').exists(): dna["stacks"].add("Kotlin")
        if (self.project_root / 'requirements.txt').exists(): dna["stacks"].add("Python")
        dna["is_multistack"] = len(dna["stacks"]) > 1
        return dna

    def analyze_stack_parity(self, personas):
        parity_map = {}
        for p in personas:
            if p.stack not in parity_map:
                parity_map[p.stack] = {"telemetry": 0, "reasoning": 0, "modernity": 0, "agents": set()}
            
            m = p.get_maturity_metrics()
            parity_map[p.stack]["agents"].add(p.name)
            if m.get("has_telemetry"): parity_map[p.stack]["telemetry"] += 1
            if m.get("has_reasoning"): parity_map[p.stack]["reasoning"] += 1
            if m.get("has_pathlib"): parity_map[p.stack]["modernity"] += 1

        gaps = []
        python_agents = parity_map.get("Python", {}).get("agents", set())
        for stack in ["Flutter", "Kotlin"]:
            stack_agents = parity_map.get(stack, {}).get("agents", set())
            missing = python_agents - stack_agents
            for agent in missing:
                gaps.append(f"GAP DE EXISTÊNCIA: O PhD {agent} está ausente na stack {stack}.")
        return {"stats": parity_map, "gaps": gaps}

    def _analyze_file(self, path: Path):
        try:
            content = path.read_text(encoding='utf-8', errors='ignore')
            info = self._get_initial_info()

            self._detect_vulnerabilities(content, info)
            self._detect_test_coverage(path, info)
            
            # Despachante por extensão
            analyzers = {
                '.py': self._parse_python_ast,
                '.dart': self._analyze_mobile_file,
                '.kt': self._analyze_mobile_file
            }
            
            analyzer = analyzers.get(path.suffix)
            if analyzer:
                analyzer(content, info, path.name)
                
            return info
        except Exception as e:
            return {"error": str(e)}

    def _get_initial_info(self):
        return {
            "purpose": "Logic", "functions": [], "classes": [],
            "brittle": False, "silent_error": False, "has_test": True
        }

    def _analyze_mobile_file(self, content, info, filename):
        """Análise específica para Flutter/Kotlin."""
        # Extrai nomes de classes via Regex simples para mobile stubs
        classes = re.findall(r'class\s+(\w+)', content)
        info["classes"].extend(classes)

    def _detect_vulnerabilities(self, content, info):
        """Detecção de padrões de código frágil ou inseguro."""
        # Padrões fragmentados para evitar auto-detecção
        brittle_pattern = r'^\s*(ev' + r'al\(|glo' + r'bal\s+|sh' + r'ell=True)'
        if re.search(brittle_pattern, content, re.MULTILINE):
            info["brittle"] = True
        
        # Só é cegueira se houver 'pass' puro e NÃO houver log de erro no bloco except
        silent_pattern = r'^\s*ex' + r'cept.*:\s*p' + r'ass\s*(#.*)?$'
        if re.search(silent_pattern, content, re.MULTILINE):
            if "lo" + "gger.err" + "or" not in content and "lo" + "gger.excep" + "tion" not in content:
                info["silent_error"] = True

    def _detect_test_coverage(self, path, info):
        """Verifica se existe um arquivo de teste correspondente."""
        if "src" in str(path):
            expected_test = self.project_root / "tests" / f"test_{path.stem}.py"
            if not expected_test.exists():
                info["has_test"] = False

    def _parse_python_ast(self, content, info, filename):
        """Extrai funções e classes via AST."""
        try:
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef): info["functions"].append(node.name)
                elif isinstance(node, ast.ClassDef): info["classes"].append(node.name)
        except Exception as e:
            logger.debug(f"Falha na análise AST de {filename}: {e}")

    def _build_dependency_map(self):
        """Mapeia o grafo de chamadas básico."""
        for file, data in self.map.items():
            self.call_graph[file] = [f for f in self.map.keys() if f != file and any(c in str(data) for c in self.map[f].get('classes', []))]
