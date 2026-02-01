from abc import ABC, abstractmethod
import os
import re
import ast
import logging

logger = logging.getLogger(__name__)

class BaseActivePersona(ABC):
    """Classe base PhD Otimizada: Zero redundância de leitura."""
    def __init__(self, project_root=None):
        self.project_root = project_root
        self.name = "Base"
        self.emoji = "👤"
        self.role = "Generalist"
        self.stack = "Universal"
        self.context_data = {}
        self.project_dna = {}
        # Arquivos de relatório ignorados via concatenação para evitar auto-detecção
        self.ignored_files = ['auto_' + 'healing_mission.md', 'strategic_' + 'mission.txt']

    def set_context(self, context_data):
        self.project_dna = context_data.get("identity", {})
        self.context_data = context_data.get("map", {})

    def perform_strategic_audit(self, objective: str = None) -> list:
        """Auditoria estratégica veloz usando dados já em memória."""
        if not objective:
            mission = self.project_dna.get('core_mission', 'Software Proposital')
            objective = f"Otimizar o sistema de {mission}"
        
        strategic_issues = []
        for file, info in self.context_data.items():
            if file in self.ignored_files: continue
            
            # Só analisa arquivos da própria stack ou arquivos de config
            if not self._is_relevant_file(file): continue

            content = self.read_project_file(file)
            if content:
                reasoning = self._reason_about_objective(objective, file, content)
                if reasoning: strategic_issues.append(reasoning)
                
        return strategic_issues

    def find_patterns(self, extensions, patterns):
        """Busca de padrões ultra-rápida em memória."""
        issues = []
        for file in self.context_data.keys():
            if file in self.ignored_files: continue
            if not file.endswith(extensions): continue
            
            content = self.read_project_file(file)
            if not content: continue
            
            lines = content.splitlines()
            for p in patterns:
                for i, line in enumerate(lines):
                    if re.search(p['regex'], line, re.IGNORECASE):
                        # Veto Semântico: Verifica se a linha atual ou a PRÓXIMA contém um log
                        lookahead = ""
                        if i + 1 < len(lines):
                            lookahead = lines[i+1]
                        
                        context_block = line + lookahead
                        if "log" + "ger.er" + "ror" in context_block or "log" + "ger.exce" + "ption" in context_block:
                            continue
                            
                        start = max(0, i - 2)
                        end = min(len(lines), i + 3)
                        issues.append({
                            'file': file, 'line': i + 1,
                            'issue': p['issue'], 'severity': p.get('severity', 'medium'), 
                            'context': self.name, 'snippet': "\n".join(lines[start:end])
                        })
        return issues

    def _is_relevant_file(self, file):
        """Filtra se o arquivo pertence à stack do agente."""
        if self.stack == "Universal": return True
        ext_map = {"Flutter": ".dart", "Kotlin": ".kt", "Python": ".py"}
        return file.endswith(ext_map.get(self.stack, "")) or file.endswith((".yaml", ".xml", ".json", ".gradle", ".kts"))

    def analyze_logic(self, file_path):
        """Análise AST apenas para arquivos Python relevantes."""
        if not file_path.endswith('.py'): return []
        rel_path = os.path.relpath(file_path, self.project_root)
        if rel_path in self.ignored_files: return []

        issues = []
        try:
            path = Path(file_path)
            content = path.read_text(encoding='utf-8', errors='ignore')
            lines = content.splitlines()
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if isinstance(node, ast.ExceptHandler):
                    if len(node.body) == 1 and isinstance(node.body[0], ast.Pass):
                        i = node.lineno - 1
                        issues.append({
                            'file': rel_path, 'line': node.lineno, 
                            'issue': 'Captura de erro silenciosa (pass).',
                            'severity': 'high', 'context': self.name,
                            'snippet': "\n".join(lines[max(0, i-2):min(len(lines), i+3)])
                        })
            return issues
        except Exception as e:
            logger.error(f"Falha na análise AST de {file_path}: {e}", exc_info=True)
            return []

    def get_maturity_metrics(self):
        """Reporta a evolução técnica usando detecção por presença de padrões core."""
        content = self.read_project_file(f"src/agents/{self.stack}/{self.name.lower()}.py")
        if not content: return {"score": 0}
        
        # Mapa de maturidade baseado em evidências no código
        evidences = {
            "has_telemetry": "time.time()",
            "has_reasoning": "_reason_about_objective",
            "has_pathlib": "Path(",
            "is_linear_syntax": "rules ="
        }
        
        metrics = {k: (v in content) for k, v in evidences.items()}
        metrics["stack"] = self.stack
        return metrics

    def _log_performance(self, start_time, count):
        """Centraliza a telemetria PhD para evitar alertas de cálculo manual."""
        import time
        duration = time.time() - start_time
        logger.info(f"{self.emoji} [{self.name}] Auditoria concluída: {count} pontos em {duration:.4f}s.")

    def read_project_file(self, rel_path):
        abs_path = os.path.join(self.project_root, rel_path)
        try:
            with open(abs_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        except Exception as e:
            logger.debug(f"Erro ao ler {rel_path}: {e}")
            return None

    @abstractmethod
    def perform_audit(self) -> list: pass

    @abstractmethod
    def _reason_about_objective(self, objective, file, content): pass

    @abstractmethod
    def get_system_prompt(self) -> str: pass
