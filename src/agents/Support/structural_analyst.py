import ast
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class StructuralAnalyst:
    """Assistente Técnico: Especialista em Análise Estrutural e AST 🏗️"""
    
    def analyze_python(self, content: str, filename: str) -> dict:
        """Executa decomposição atômica de código Python, Kotlin ou arquivos estruturados."""
        if filename.endswith('.py'):
            return self._analyze_py_source(content, filename)
        if filename.endswith(('.kt', '.kts')):
            return self._analyze_kt_source(content, filename)
        if filename.endswith(('.xml', '.gradle')):
            return self._analyze_config_source(content)
        
        return {"complexity": 1, "dependencies": [], "functions": [], "classes": []}

    def _analyze_py_source(self, content, filename):
        try:
            tree = ast.parse(content)
            return {
                "complexity": self._calculate_complexity(tree),
                "dependencies": self._extract_imports(tree),
                "functions": [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)],
                "classes": [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
            }
        except Exception as e:
            logger.error(f"❌ Erro na AST Python ({filename}): {e}")
            return {"complexity": 1, "dependencies": [], "functions": [], "classes": []}

    def _analyze_kt_source(self, content, filename):
        # Heurística PhD para Kotlin: keywords de controle de fluxo
        keywords = ['if ', 'for ', 'while ', 'when ', 'catch ', '?.let', '?.also', '?.run']
        complexity = sum(content.count(kw) for kw in keywords) + 1
        return {
            "complexity": complexity,
            "dependencies": [line.split()[1] for line in content.splitlines() if line.startswith('import ')],
            "functions": [line.split('fun ')[1].split('(')[0] for line in content.splitlines() if 'fun ' in line],
            "classes": [line.split('class ')[1].split('(')[0].split('{')[0].strip() for line in content.splitlines() if 'class ' in line]
        }

    def _analyze_config_source(self, content):
        return {
            "complexity": len(content.splitlines()) // 10 + 1,
            "dependencies": [], "functions": [], "classes": []
        }

    def map_component_type(self, rel_path):
        """Mapeamento semântico universal (Python + Android/Gradle)."""
        rel_path = rel_path.lower()
        if "test" in rel_path: return "TEST"
        if "core" in rel_path or "domain" in rel_path: return "CORE"
        if "agent" in rel_path: return "AGENT"
        if "util" in rel_path or "helper" in rel_path: return "UTIL"
        if "ui" in rel_path or "screen" in rel_path or "layout" in rel_path: return "INTERFACE"
        if "data" in rel_path or "repository" in rel_path: return "DATA"
        return "LOGIC"

    def _calculate_complexity(self, tree):
        count = 1
        for node in ast.walk(tree):
            if isinstance(node, (ast.If, ast.While, ast.For, ast.ExceptHandler, ast.With)):
                count += 1
            elif isinstance(node, ast.BoolOp):
                count += len(node.values) - 1
        return count

    def _extract_imports(self, tree):
        imports = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names: imports.append(alias.name)
            elif isinstance(node, ast.ImportFrom):
                if node.module: imports.append(node.module)
        return list(set(imports))

    def read_project_file(self, full_path: Path):
        """Lê o conteúdo de um arquivo com segurança de encoding."""
        try:
            return full_path.read_text(encoding='utf-8', errors='ignore')
        except Exception as e:
            logger.error(f"❌ Erro crítico ao ler o arquivo {full_path}: {e}", exc_info=True)
            return None

    def analyze_logic_flaws(self, tree, rel_path, lines, agent_name):
        """Identifica padrões de falha lógica via AST."""
        issues = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ExceptHandler):
                # Detecta bare except ou except pass
                if not node.type or (len(node.body) == 1 and isinstance(node.body[0], ast.Pass)):
                    i = node.lineno - 1
                    issues.append({
                        'file': rel_path, 'line': node.lineno, 
                        'issue': 'Captura de erro silenciosa ou bare except detectado.',
                        'severity': 'high', 'context': agent_name,
                        'snippet': "\n".join(lines[max(0, i-2):min(len(lines), i+3)])
                    })
        return issues

    def calculate_maturity(self, content: str, stack: str) -> dict:
        """Reporta a evolução técnica usando detecção por presença de padrões core."""
        evidences = {
            "has_telemetry": "time.time()",
            "has_reasoning": "_reason_about_objective",
            "has_pathlib": "Path(",
            "is_linear_syntax": "rules ="
        }
        metrics = {k: (v in content) for k, v in evidences.items()}
        metrics["stack"] = stack
        return metrics

    def should_ignore(self, path: Path):
        """Centraliza regras de exclusão de arquivos."""
        ignored = {'.git', '__pycache__', 'build', 'node_modules', '.venv', '.agent', '.gemini', 'submodules'}
        return any(part in ignored for part in path.parts)

    def is_analyable(self, path: Path):
        """Define arquivos elegíveis para auditoria."""
        return path.is_file() and path.suffix in {'.py', '.dart', '.kt', '.yaml', '.xml'}
