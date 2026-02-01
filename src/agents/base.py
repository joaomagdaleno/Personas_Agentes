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
        # Arquivos de relatório que devem ser ignorados para evitar redundância
        self.ignored_files = ['auto_healing_mission.md', 'strategic_mission.txt', 'todos_agentes_flutter.txt', 'todos_agentes_kotlin.txt']

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
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
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
        """Reporta o nível de evolução técnica do agente para o Analisador de Paridade."""
        content = self.read_project_file(f"src/agents/{self.stack}/{self.name.lower()}.py")
        if not content: return {"score": 0}
        
        return {
            "has_telemetry": "time.time()" in content,
            "has_reasoning": "_reason_about_objective" in content and "None" not in content,
            "has_pathlib": "Path(" in content,
            "is_linear_syntax": "rules =" in content or "r =" in content,
            "stack": self.stack
        }

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
