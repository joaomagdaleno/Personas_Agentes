import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class StructuralAnalyst:
    """
    🏗️ Analista Estrutural PhD.
    Especialista em decomposição atômica de código, mapeando complexidade,
    dependências e topologia para a base de conhecimento do Maestro.
    """
    
    def __init__(self):
        from src_local.agents.Support.maturity_evaluator import MaturityEvaluator
        from src_local.agents.Support.source_code_parser import SourceCodeParser
        from src_local.agents.Support.component_classifier import ComponentClassifier
        from src_local.agents.Support.logic_auditor import LogicAuditor
        self.maturity_evaluator = MaturityEvaluator()
        self.parser = SourceCodeParser()
        self.classifier = ComponentClassifier()
        self.logic_auditor = LogicAuditor()

    def analyze_python(self, content: str, filename: str) -> dict:
        """
        🧬 Coordena a decomposição técnica via delegação para o SourceCodeParser.
        Injeta telemetria de processamento para garantir observabilidade PhD.
        """
        start_t = time.time()
        res = {"complexity": 1, "dependencies": [], "functions": [], "classes": []}
        
        if filename.endswith('.py'):
            d = self.parser.analyze_py(content)
            if d["tree"]:
                res = {
                    "complexity": self.parser.calculate_py_complexity(d["tree"]),
                    "dependencies": self.parser.extract_py_imports(d["tree"]),
                    "functions": d["functions"], "classes": d["classes"],
                    "telemetry": "telemetry" in content or "log_performance" in content
                }
        elif filename.endswith(('.kt', '.kts')):
            d = self.parser.analyze_kt(content)
            res = {
                "complexity": self.parser.calculate_kt_complexity(content),
                "dependencies": d["imports"], "functions": d["functions"], "classes": d["classes"]
            }
            
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_t, f"⏱️ [StructuralAnalyst] Decomposição em {filename}")
            
        return res

    def map_component_type(self, rel_path: str):
        """
        🗂️ Mapeia o tipo de componente soberano baseado na topologia do diretório.
        Identifica AGENT, CORE, UTIL, TEST, etc.
        """
        return self.classifier.map_type(rel_path)

    def analyze_logic_flaws(self, tree, rel_path, lines, agent_name, ignore_test_context=False):
        """
        🕵️ Varredura profunda de fragilidades lógicas via AST.
        Detecta silenciamentos de erro e padrões estruturais perigosos.
        """
        return self.logic_auditor.scan_flaws(tree, rel_path, lines, agent_name, ignore_test_context=ignore_test_context)

    def analyze_file_logic(self, file_path, project_root, ignored_files, agent_name):
        """🧬 Auxiliar para análise lógica via delegação AST."""
        if not str(file_path).endswith('.py'): return []
        try:
            target_path = Path(file_path)
            rel_path = str(target_path.relative_to(project_root)).replace("\\", "/")
            if rel_path in ignored_files: return []
            content = self.read_project_file(target_path)
            if content:
                import ast
                return self.analyze_logic_flaws(ast.parse(content), rel_path, content.splitlines(), agent_name)
        except Exception as e:
            logger.error(f"❌ Falha na análise lógica delegada de {file_path}: {e}")
        return []

    def calculate_maturity(self, content: str, stack: str) -> dict:
        """
        📊 Avalia a maturidade técnica do Agente PhD.
        Mapeia a conformidade com padrões modernos (Pathlib, Telemetria, etc).
        """
        return self.maturity_evaluator.calculate_maturity(content, stack)

    def should_ignore(self, path: Path):
        """
        🛡️ Veto de Escopo: Determina se um caminho deve ser ignorado na auditoria.
        Isola metadados de controle (.git, .agent) da análise de produção.
        """
        ignored = {'.git', '__pycache__', 'build', 'node_modules', '.venv', '.agent', '.gemini', 'submodules'}
        return any(part in ignored for part in path.parts)

    def is_analyable(self, path: Path):
        """
        🔍 Valida se o arquivo possui extensão suportada para análise PhD.
        Suporta Python, Kotlin, Dart, YAML e XML.
        """
        return path.is_file() and path.suffix in {'.py', '.dart', '.kt', '.yaml', '.xml'}

    def read_project_file(self, full_path: Path):
        """
        💾 Realiza a leitura atômica de arquivos do projeto com tratamento de encoding.
        Garante integridade mesmo em sistemas com encodings não padrão.
        """
        try:
            return full_path.read_text(encoding='utf-8', errors='ignore')
        except Exception as e:
            logger.warning(f"❌ Erro ao ler {full_path}: {e}")
            return None

    def analyze_intent(self, content: str, filename: str, cognitive_engine) -> dict:
        """
        🧠 Análise de Intenção Cognitiva via LLM.
        Verifica se a implementação do código condiz com seu propósito declarado (Docstring).
        """
        if not content or not cognitive_engine: return None
        
        # Extrai docstring e assinatura para economizar tokens
        import ast
        try:
            tree = ast.parse(content)
            docstring = ast.get_docstring(tree)
            if not docstring: return None # Sem intenção declarada, sem análise
        except:
            return None

        prompt = f"""
        Você é um Auditor de Intenção de Software PhD.
        Analise se o código abaixo cumpre o que promete em sua docstring.
        
        ARQUIVO: {filename}
        DOCSTRING: "{docstring}"
        
        CÓDIGO (Resumo):
        {content[:2000]}  # Limitado a 2k caracteres para foco
        
        RESPONDA EM JSON:
        {{
            "consistent": true/false,
            "issue": "Breve descrição se houver discrepância ou risco oculto",
            "severity": "LOW/MEDIUM/HIGH/CRITICAL"
        }}
        """
        
        try:
            import json
            response = cognitive_engine.reason(prompt)
            # Tenta extrair JSON do markdown
            import re
            match = re.search(r"\{.*\}", response, re.DOTALL)
            if match:
                data = json.loads(match.group(0))
                if not data.get("consistent", True):
                    return {
                        "file": filename,
                        "line": 1,
                        "issue": f"Desvio de Intenção: {data.get('issue')}",
                        "severity": data.get("severity", "MEDIUM"),
                        "context": "CognitiveIntent"
                    }
        except Exception as e:
            logger.warning(f"⚠️ Falha na análise cognitiva de {filename}: {e}")
            
        return None

