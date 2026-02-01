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
                rel_path = str(path.relative_to(self.project_root))
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
            info = {
                "purpose": "Logic", "functions": [], "classes": [],
                "brittle": False, "silent_error": False, "has_test": True
            }

            if re.search(r'^\s*(eval\(|global\s+|shell=True)', content, re.MULTILINE):
                info["brittle"] = True
            
            if re.search(r'^\s*except.*:\s*pass\s*$', content, re.MULTILINE):
                info["silent_error"] = True

            if "src" in str(path):
                expected_test = self.project_root / "tests" / f"test_{path.stem}.py"
                if not expected_test.exists():
                    info["has_test"] = False

            if path.suffix == '.py':
                try:
                    tree = ast.parse(content)
                    for node in ast.walk(tree):
                        if isinstance(node, ast.FunctionDef): info["functions"].append(node.name)
                        elif isinstance(node, ast.ClassDef): info["classes"].append(node.name)
                except Exception as e:
                    logger.debug(f"Falha na análise AST de {path.name}: {e}")
            return info
        except Exception as e:
            return {"error": str(e)}

    def _build_dependency_map(self):
        """Mapeia o grafo de chamadas básico."""
        for file, data in self.map.items():
            self.call_graph[file] = [f for f in self.map.keys() if f != file and any(c in str(data) for c in self.map[f].get('classes', []))]
