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
        support = InfrastructureAssembler.assemble_core_support()
        self.audit_engine = support.get("audit_engine")
        self.structural_analyst = support["analyst"]
        self.integrity_guardian = support["guardian"]

    def set_context(self, context_data):
        """🧠 Sincroniza o cérebro do Agente com o DNA e o Mapa do projeto alvo."""
        self.project_dna = context_data.get("identity", {})
        self.context_data = context_data.get("map", {})

    def perform_strategic_audit(self, objective: str = None, file_target: str = None, content_target: str = None) -> list:
        """🎯 Executa auditoria focada no objetivo estratégico."""
        if file_target and content_target:
            res = self._reason_about_objective(objective or "Verificação", file_target, content_target)
            return [res] if res else []

        obj = self.integrity_guardian.get_audit_mission(self.project_dna, objective)
        strategic_issues = []
        
        for file, content in self._iter_auditable_files():
            res = self._reason_about_objective(obj, file, content)
            if res: strategic_issues.append(res)
        return strategic_issues

    def _iter_auditable_files(self):
        """Gerador para iteração limpa e eficiente de arquivos auditáveis."""
        for file in self.context_data.keys():
            if self._should_audit_file(file):
                content = self.read_project_file(file)
                if content:
                    yield file, content

    def _should_audit_file(self, file):
        """
        Valida se o arquivo é relevante para a persona e stack.
        Filtra arquivos ignorados e delegada a relevância ao IntegrityGuardian.
        """
        if file in self.ignored_files: return False
        return self.integrity_guardian.is_relevant_file(file, self.stack)

    def find_patterns(self, extensions, patterns):
        """🔍 Varredura delegada ao AuditEngine."""
        if not self.audit_engine: return []
        files = [f for f in self.context_data.keys() if f.endswith(extensions) and f not in self.ignored_files]
        return self.audit_engine.scan_multiple_files(files, patterns, self.read_project_file, self.context_data, self.name)

    def analyze_logic(self, file_path):
        """🧬 Análise AST delegada ao StructuralAnalyst."""
        return self.structural_analyst.analyze_file_logic(file_path, self.project_root, self.ignored_files, self.name)

    def get_maturity_metrics(self):
        """📊 Métricas de evolução via StructuralAnalyst delegado."""
        path = f"src/agents/{self.stack}/{self.name.lower()}.py"
        content = self.read_project_file(path)
        return self.structural_analyst.calculate_maturity(content, self.stack) if content else {"score": 0}

    def _log_performance(self, start_time, count):
        """
        🛰️ Utilitário soberano para telemetria de performance padronizada.
        Injeta métricas de desempenho no sistema de logs PhD.
        """
        from src_local.utils.logging_config import log_performance
        log_performance(logger, start_time, f"{self.emoji} [{self.name}] Auditoria: {count} pontos", level=logging.INFO)

    def read_project_file(self, rel_path):
        """💾 Lê arquivo via Pathlib (Modern API) com garantia de encoding UTF-8."""
        abs_path = Path(self.project_root) / rel_path
        try:
            return abs_path.read_text(encoding='utf-8', errors='ignore')
        except Exception as e:
            logger.warning(f"⚠️ Falha na leitura do arquivo {rel_path}: {e}")
            return None

    @abstractmethod
    def perform_audit(self) -> list: pass
    @abstractmethod
    def _reason_about_objective(self, objective, file, content): pass
    @abstractmethod
    def get_system_prompt(self) -> str: pass