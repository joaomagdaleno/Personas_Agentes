from abc import ABC, abstractmethod
import ast
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class BaseActivePersona(ABC):
    """Base PhD Soberana: Coordenador ultra-leve via delegação técnica."""
    
    def __init__(self, project_root=None):
        self.project_root = project_root
        self.name, self.emoji, self.role, self.stack = "Base", "👤", "Generalist", "Universal"
        self.context_data, self.project_dna = {}, {}
        self.ignored_files = ['auto_' + 'healing_mission.md', 'strategic_' + 'mission.txt']
        
        # Agentes de Suporte (Injeção via Core)
        from src.agents.Support.infrastructure_assembler import InfrastructureAssembler
        support = InfrastructureAssembler.assemble_core_support()
        self.audit_engine = support.get("audit_engine") # Criado na etapa anterior
        self.structural_analyst = support["analyst"]
        self.integrity_guardian = support["guardian"]

    def set_context(self, context_data):
        self.project_dna = context_data.get("identity", {})
        self.context_data = context_data.get("map", {})

    def perform_strategic_audit(self, objective: str = None, file_target: str = None, content_target: str = None) -> list:
        """Executa auditoria focada no objetivo estratégico."""
        if file_target and content_target:
            reasoning = self._reason_about_objective(objective or "Verificação", file_target, content_target)
            return [reasoning] if reasoning else []

        obj = self.integrity_guardian.get_audit_mission(self.project_dna, objective)
        strategic_issues = []
        
        for file in self.context_data.keys():
            if file in self.ignored_files or not self.integrity_guardian.is_relevant_file(file, self.stack):
                continue
            
            content = self.read_project_file(file)
            if content:
                res = self._reason_about_objective(obj, file, content)
                if res: strategic_issues.append(res)
        return strategic_issues

    def find_patterns(self, extensions, patterns):
        """Varredura de padrões via AuditEngine delegado."""
        from src.agents.Support.audit_engine import AuditEngine
        engine = AuditEngine() # Fallback local se não injetado
        
        issues = []
        for file in self.context_data.keys():
            if file in self.ignored_files or not file.endswith(extensions): continue
            content = self.read_project_file(file)
            if content:
                issues.extend(engine.scan_content(file, content, patterns, self.context_data, self.name))
        return issues

    def analyze_logic(self, file_path):
        """Análise AST via StructuralAnalyst delegado."""
        if not file_path.endswith('.py'): return []
        
        target_path = Path(file_path)
        rel_path = str(target_path.relative_to(self.project_root)).replace("\\", "/")
        
        if rel_path in self.ignored_files: return []
        try:
            content = self.structural_analyst.read_project_file(target_path)
            if content:
                return self.structural_analyst.analyze_logic_flaws(ast.parse(content), rel_path, content.splitlines(), self.name)
            return []
        except Exception as e:
            logger.error(f"❌ Falha na análise lógica de {rel_path}: {e}", exc_info=True)
            return []

    def get_maturity_metrics(self):
        """Métricas de evolução via StructuralAnalyst delegado."""
        path = f"src/agents/{self.stack}/{self.name.lower()}.py"
        content = self.read_project_file(path)
        return self.structural_analyst.calculate_maturity(content, self.stack) if content else {"score": 0}

    def _log_performance(self, start_time, count):
        import time
        logger.info(f"{self.emoji} [{self.name}] Auditoria: {count} pontos em {time.time() - start_time:.4f}s.")

    def read_project_file(self, rel_path):
        """Lê arquivo via Pathlib (Modern API)."""
        try:
            abs_path = Path(self.project_root) / rel_path
            return abs_path.read_text(encoding='utf-8', errors='ignore')
        except Exception as e:
            logger.debug(f"ℹ️ Não foi possível ler o arquivo {rel_path}: {e}")
            return None

    @abstractmethod
    def perform_audit(self) -> list: pass
    @abstractmethod
    def _reason_about_objective(self, objective, file, content): pass
    @abstractmethod
    def get_system_prompt(self) -> str: pass
