from abc import ABC, abstractmethod
import ast
import logging
import time
from pathlib import Path

logger = logging.getLogger(__name__)

class BaseActivePersona(ABC):
    """Base PhD Soberana: Coordenador ultra-leve via delegação técnica."""
    
    def __init__(self, project_root=None):
        self.project_root = project_root
        self.name, self.emoji, self.role, self.stack = "Base", "👤", "Generalist", "Universal"
        self.context_data, self.project_dna = {}, {}
        self.ignored_files = ['auto_healing_mission.md', 'strategic_mission.txt']
        self._initialize_support_tools()

    def _initialize_support_tools(self):
        from src_local.agents.Support.infrastructure_assembler import InfrastructureAssembler
        from src_local.utils.cognitive_engine import CognitiveEngine
        from src_local.agents.Support.maturity_evaluator import MaturityEvaluator
        
        support = InfrastructureAssembler.assemble_core_support()
        self.audit_engine = support.get("audit_engine")
        self.structural_analyst = support["analyst"]
        self.integrity_guardian = support["guardian"]
        self.cognitive = CognitiveEngine()
        self.maturity_evaluator = MaturityEvaluator(self.structural_analyst)

    def set_context(self, context_data):
        self.project_dna = context_data.get("identity", {})
        self.context_data = context_data.get("map", {})

    def perform_strategic_audit(self, objective: str = None, file_target: str = None, content_target: str = None) -> list:
        if file_target and content_target:
            res = self._reason_about_objective(objective or "Verificação", file_target, content_target)
            return [res] if res else []

        obj = self.integrity_guardian.get_audit_mission(self.project_dna, objective)
        strategic_issues = []
        
        from src_local.utils.context_iterator import ContextIterator
        iterator = ContextIterator(self.project_root, self.context_data, self.integrity_guardian, self.ignored_files, self.stack)
        
        for file, content in iterator.iter_auditable_files():
            res = self._reason_about_objective(obj, file, content)
            if res: strategic_issues.append(res)
        return strategic_issues

    def find_patterns(self, extensions, patterns):
        if not self.audit_engine: return []
        # Simplificação: Filtro direto
        files = [f for f in self.context_data.keys() 
                 if f.endswith(extensions) and f not in self.ignored_files 
                 and self.context_data[f].get("component_type") != "TEST"]
        return self.audit_engine.scan_multiple_files(files, patterns, self.read_project_file, self.context_data, self.name)

    def analyze_logic(self, file_path):
        return self.structural_analyst.analyze_file_logic(file_path, self.project_root, self.ignored_files, self.name)

    def get_maturity_metrics(self):
        """Delegação total ao MaturityEvaluator."""
        return self.maturity_evaluator.evaluate_persona(self.project_root, self.stack, self.name)

    def read_project_file(self, rel_path):
        """💾 Lê arquivo via Pathlib (Modern API) com garantia de encoding UTF-8."""
        abs_path = Path(self.project_root) / rel_path
        try:
            return abs_path.read_text(encoding='utf-8', errors='ignore')
        except Exception as e:
            logger.warning(f"⚠️ Falha na leitura do arquivo {rel_path}: {e}")
            return None

    def _log_performance(self, start_time, count):
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_time, f"{self.emoji} [{self.name}] Auditoria: {count} pontos", level=logging.INFO)

    def reason(self, prompt: str) -> str:
        if not self.cognitive: return None
        return self.cognitive.reason(prompt)

    @abstractmethod
    def perform_audit(self) -> list: ...
    @abstractmethod
    def _reason_about_objective(self, objective, file, content): ...
    @abstractmethod
    def get_system_prompt(self) -> str: ...
